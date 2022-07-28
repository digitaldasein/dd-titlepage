// SPDX-FileCopyrightText: 2022 Digital Dasein <https://digital-dasein.gitlab.io/>
// SPDX-FileCopyrightText: 2022 Gerben Peeters <gerben@digitaldasein.org>
// SPDX-FileCopyrightText: 2022 Senne Van Baelen <senne@digitaldasein.org>
//
// SPDX-License-Identifier: MIT

import { html, css, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

/*---------------------------------------------------------------------*/
/* Config                                                              */
/*---------------------------------------------------------------------*/

const DEFAULT_ATTRIBUTES = {
  mainTitle: '',
  subTitle: '',
  imgSrc: '',
  author: '',
  organisation: '',
  organisationUrl: '',
  date: '',
  fromSelector: 'dd-slide-collection',
  configPath: '',
  noDefaultMap: false,
  centerText: false,
  centerImg: false,
  htmlTopLeft: '',
  htmlTopRight: '',
  htmlMidLeft: '',
  htmlMidRight: '',
  htmlBotLeft: '',
  htmlBotRight: '',
};

/*---------------------------------------------------------------------*/
/* Utils                                                               */
/*---------------------------------------------------------------------*/

/*
function timeout(ms:number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
*/

async function getJsonConfig(url: string) {
  /* first check head to see if file exists (no need to fetch whole file if
   * when looping over multiple possible filepaths */
  const _checkFileExists = async (urlCheck: string) => {
    const response = await fetch(urlCheck, { method: 'HEAD' });
    if (response.status !== 404) {
      return true;
    }

    console.error(`JSON config does not exist at '${urlCheck}'`);
    return false;
  };

  const bFile = await _checkFileExists(url);

  if (bFile) {
    try {
      const response = await fetch(url);
      const json = await response.json();
      return json;
    } catch (err: any) {
      console.error(`Error while reading config file at ${url} \n\n ${err}`);
    }
  }

  return {
    error: 'Could not parse JSON config, see console for errors',
  };
}

export class DdTitlepage extends LitElement {
  static styles = css`
    :host {
      /* slide placeholders */
      --slide-ratio: var(--dd-slide-ratio, calc(16 / 9));
      --slide-width: var(--dd-slide-width, 1024px);
      --slide-height: var(
        --dd-slide-height,
        calc(var(--slide-width) / var(--slide-ratio))
      );
      --titlepage-font-size: var(--dd-titlepage-font-size, 24px);
      --titlepage-font: var(--dd-font, 24px/2 'Roboto', sans-serif);

      /* titlepage */
      --titlepage-padding-side: var(--dd-titlepage-padding-side, 50px);
      --titlepage-padding-left: var(--titlepage-padding-side);
      --titlepage-padding-right: var(--titlepage-padding-side);
      --titlepage-padding-top-top: var(--dd-titlepage-padding-top-top, 10px);
      --titlepage-padding-mid-top: var(--dd-titlepage-padding-mid-top, 100px);
      --titlepage-padding-bot-top: var(--dd-titlepage-padding-bot-top, 10px);
      --titlepage-padding-sectop: var(--titlepage-padding-top-top)
        var(--titlepage-padding-right) 0 var(--titlepage-padding-left);
      --titlepage-padding-secmid: var(--titlepage-padding-mid-top)
        var(--titlepage-padding-right) 0 var(--titlepage-padding-left);
      --titlepage-padding-secbot: var(--titlepage-padding-bot-top)
        var(--titlepage-padding-right) 0 var(--titlepage-padding-left);

      --titlepage-align-lsec: var(--dd-titlepage-align-lsec, left);
      --titlepage-align-rsec: var(--dd-titlepage-align-rsec, right);

      --titlepage-w-left: var(--dd-titlepage-w-left, 100%);
      --titlepage-h-top: var(
        --dd-titlepage-h-top,
        calc(0.15 * var(--slide-height))
      );
      --titlepage-h-middle: var(
        --dd-titlepage-h-middle,
        calc(
          var(--slide-height) - var(--titlepage-h-top) -
            var(--titlepage-h-bottom)
        )
      );
      --titlepage-h-bottom: var(
        --dd-titlepage-h-bottom,
        calc(0.2 * var(--slide-height))
      );

      --titlepage-title-font-size: var(
        --dd-titlepage-title-font-size,
        calc(2.15 * var(--titlepage-font-size))
      );
      --titlepage-subtitle-font-size: var(
        --dd-titlepage-subtitle-font-size,
        calc(0.6 * var(--titlepage-title-font-size))
      );

      --titlepage-logo-height: var(
        --dd-titlepage-logo-height,
        calc(var(--titlepage-h-top) / 1.3)
      );
      --titlepage-logo-top: var(
        --dd-titlepage-logo-top,
        calc(var(--titlepage-h-top) - var(--titlepage-logo-height) / 2)
      );
      --titlepage-logo-left: var(
        --dd-titlepage-logo-left,
        var(--titlepage-padding-side)
      );

      /* dd color pallette */
      --titlepage-prim-color: var(--dd-prim-color, rgba(153, 155, 132, 1));
      --titlepage-prim-color: var(--dd-prim-color, rgba(121, 135, 119, 1));
      /*

      */
      --titlepage-prim-color-dark: var(
        --dd-prim-color-dark,
        rgba(65, 90, 72, 1)
      );
      --titlepage-sec-color: var(--dd-sec-color, rgba(248, 237, 227, 1));
      --titlepage-sec-color-dark: var(
        --dd-sec-color-dark,
        rgba(238, 254, 216, 1)
      );
      --titlepage-text-color: var(--dd-text-color, rgba(0, 0, 0, 0.9));
      --titlepage-text-color-light: var(
        --dd-text-color-light,
        rgba(255, 255, 255, 1)
      );

      font: var(--titlepage-font);
      font-size: var(--titlepage-font-size);

      display: block;
    }

    :host(.slide) {
      position: relative;
      z-index: 0;
      overflow: hidden;
      box-sizing: border-box;
      width: var(--slide-width);
      height: var(--slide-height);
      background-color: white;
      max-width: 100%;
    }

    .dd-titlepage {
      min-height: 100%;
      height: 100%;
      width: 100%;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      margin: 0;
      display: grid;
      grid-template-areas:
        'top-l top-r'
        'mid-l mid-r'
        'bot-l bot-r';
      grid-template-columns: var(--titlepage-w-left) 1fr;
      grid-template-rows: var(--titlepage-h-top) auto var(--titlepage-h-bottom);
      align-items: top;
      justify-content: space-between;
      /* make sure slide number is not shown */
      z-index: 5;
    }

    #dd-titlepage-logo {
      position: absolute;
      top: var(--titlepage-logo-top);
      left: var(--titlepage-logo-left);
    }

    #dd-titlepage-logo img {
      height: var(--titlepage-logo-height);
      width: auto;
    }

    .dd-titlepage-top-l {
      grid-area: top-l;
      text-align: var(--titlepage-align-lsec);
    }
    .dd-titlepage-top-r {
      grid-area: top-r;
      text-align: var(--titlepage-align-rsec);
    }

    .dd-titlepage-mid-l {
      text-align: var(--titlepage-align-lsec);
      grid-area: mid-l;
    }
    .dd-titlepage-mid-r {
      grid-area: mid-r;
      text-align: var(--titlepage-align-rsec);
    }

    .dd-titlepage-bot-l {
      grid-area: bot-l;
      text-align: var(--titlepage-align-lsec);
    }
    .dd-titlepage-bot-r {
      grid-area: bot-r;
      text-align: var(--titlepage-align-rsec);
    }

    .dd-titlepage-top {
      top: 0;
      background-color: var(--titlepage-sec-color);
      color: var(--titlepage-text-color);
      padding: var(--titlepage-padding-sectop);
    }

    .dd-titlepage-middle {
      max-height: var(--titlepage-h-middle);
      background-color: var(--titlepage-prim-color);
      color: var(--titlepage-text-color-light);
      padding: var(--titlepage-padding-secmid);
    }

    .dd-titlepage-bottom {
      padding: var(--titlepage-padding-secbot);
      background-color: var(--titlepage-sec-color);
      color: var(--titlepage-text-color);
    }
    .dd-titlepage-bottom .default {
      font-size: calc(0.45 * var(--titlepage-title-font-size));
      line-height: 1.3em;
    }

    .dd-titlepage-title {
      font-size: var(--titlepage-title-font-size);
      line-height: 1.3em;
    }

    .dd-titlepage-subtitle {
      padding-top: 0.8em;
      font-size: var(--titlepage-subtitle-font-size);
      line-height: 1.3em;
    }

    .dd-titlepage-org-url {
      text-decoration: none;
      /*color: var(--titlepage-text-color)*/
    }

    @media (max-width: 1168px) {
      :host {
        --titlepage-title-font-size: calc(1.8 * var(--titlepage-font-size));
        --slide-width: 1000px;
      }
    }
    @media (max-width: 700px) {
      :host {
        --titlepage-title-font-size: calc(1.2 * var(--titlepage-font-size));
        --slide-width: 600px;
      }
    }
  `;

  @property({ type: String, attribute: 'img-src' })
  imgSrc = DEFAULT_ATTRIBUTES.imgSrc;

  @property({ type: String, attribute: 'main-title' })
  mainTitle = DEFAULT_ATTRIBUTES.mainTitle;

  @property({ type: String, attribute: 'sub-title' })
  subTitle = DEFAULT_ATTRIBUTES.subTitle;

  @property({ type: String, attribute: 'author' })
  author = DEFAULT_ATTRIBUTES.author;

  @property({ type: String, attribute: 'organisation' })
  organisation = DEFAULT_ATTRIBUTES.organisation;

  @property({ type: String, attribute: 'organisation-url' })
  organisationUrl = DEFAULT_ATTRIBUTES.organisationUrl;

  @property({ type: String, attribute: 'date' })
  date = DEFAULT_ATTRIBUTES.date;

  @property({ type: Boolean, attribute: 'no-default-map' })
  noDefaultMap = DEFAULT_ATTRIBUTES.noDefaultMap;

  @property({ type: Boolean, attribute: 'center-text' })
  centerText = DEFAULT_ATTRIBUTES.centerText;

  @property({ type: Boolean, attribute: 'center-img' })
  centerImg = DEFAULT_ATTRIBUTES.centerImg;

  @property({ type: String, attribute: 'config-path' })
  configPath = DEFAULT_ATTRIBUTES.configPath;

  @property({ type: String, attribute: 'from-selector' })
  fromSelector = DEFAULT_ATTRIBUTES.fromSelector;

  @property({ type: String, attribute: 'html-top-left' })
  htmlTopLeft = DEFAULT_ATTRIBUTES.htmlTopLeft;

  @property({ type: String, attribute: 'html-top-right' })
  htmlTopRight = DEFAULT_ATTRIBUTES.htmlTopRight;

  @property({ type: String, attribute: 'html-mid-left' })
  htmlMidLeft = DEFAULT_ATTRIBUTES.htmlMidLeft;

  @property({ type: String, attribute: 'html-mid-right' })
  htmlMidRight = DEFAULT_ATTRIBUTES.htmlMidRight;

  @property({ type: String, attribute: 'html-bot-left' })
  htmlBotLeft = DEFAULT_ATTRIBUTES.htmlBotLeft;

  @property({ type: String, attribute: 'html-bot-right' })
  htmlBotRight = DEFAULT_ATTRIBUTES.htmlBotRight;

  makeTitlePage() {
    return `
        <div class='dd-titlepage'>

          <!-- logo -->
          <div id="dd-titlepage-logo">
            <img src="${this.imgSrc}" alt="dd-logo";>
          </div>

          <!-- top -->
          <div class="dd-titlepage-top-l dd-titlepage-top">
              ${this.htmlTopLeft}
          </div>
          <div class="dd-titlepage-top-r dd-titlepage-top">
              ${this.htmlTopRight}
          </div>

          <!-- middle -->
          <div class="dd-titlepage-mid-l dd-titlepage-middle">
            ${this.htmlMidLeft}
          </div>
          <div class="dd-titlepage-mid-r dd-titlepage-middle">
            ${this.htmlMidRight}
          </div>

          <!-- bottom -->
          <div class="dd-titlepage-bot-l dd-titlepage-bottom">
            ${this.htmlBotLeft}
          </div>
          <div class="dd-titlepage-bot-r dd-titlepage-bottom">
            ${this.htmlBotRight}
          </div>
        </div>
      `;
  }

  mapDefault() {
    if (this.mainTitle || this.subTitle) {
      this.htmlMidLeft = `
        <div class="dd-titlepage-title dd-titlepage-mid-l default">
          <strong>${this.mainTitle}</strong>
        </div>
        <div class="dd-titlepage-subtitle dd-titlepage-mid-l default">
          ${this.subTitle}
        </div>`;
    }

    if (this.author || this.organisation || this.date) {
      if (this.organisationUrl)
        this.htmlBotLeft = `
          <div class="dd-titlepage-bot-l default">
          <strong>${this.author}</strong>  <br>
          <a class="dd-titlepage-org-url" href="${this.organisationUrl}">${this.organisation}</a> <br>
          ${this.date}
        </div>`;
      else
        this.htmlBotLeft = `
          <div class="dd-titlepage-bot-l default">
          <strong>${this.author}</strong>  <br>
                  ${this.organisation}     <br>
                  ${this.date}
        </div>`;
    }
  }

  async setPropsFromJson() {
    const jsonObj = await getJsonConfig(this.configPath);
    if (jsonObj.error)
      this.htmlMidLeft = `<i><b>[ERROR]</b>${jsonObj.error} </i>`;
    else {
      if (jsonObj.title) this.mainTitle = jsonObj.title;
      if (jsonObj.mainTitle) this.mainTitle = jsonObj.mainTitle;
      if (jsonObj.subTitle) this.subTitle = jsonObj.subTitle;
      if (jsonObj.author) this.author = jsonObj.author;
      if (jsonObj.organisation) this.organisation = jsonObj.organisation;
      if (jsonObj.date) this.date = jsonObj.date;
      if (jsonObj.imgSrc) this.imgSrc = jsonObj.imgSrc;
    }
  }

  injectFromSelector() {
    const injectFromElem = document.querySelector(this.fromSelector);

    // relevant dd-slide-collection attributes
    if (injectFromElem) {
      if (injectFromElem.getAttribute('main-title'))
        this.mainTitle = injectFromElem!.getAttribute('main-title') as string;

      if (injectFromElem.getAttribute('sub-title'))
        this.subTitle = injectFromElem!.getAttribute('sub-title') as string;

      if (injectFromElem.getAttribute('author'))
        this.author = injectFromElem!.getAttribute('author') as string;

      if (injectFromElem.getAttribute('date'))
        this.date = injectFromElem!.getAttribute('date') as string;

      if (injectFromElem.getAttribute('organisation'))
        this.organisation = injectFromElem!.getAttribute(
          'organisation'
        ) as string;

      if (injectFromElem.getAttribute('organisation-url'))
        this.organisationUrl = injectFromElem!.getAttribute(
          'organisation-url'
        ) as string;

      if (injectFromElem.getAttribute('img-src'))
        this.imgSrc = injectFromElem!.getAttribute('img-src') as string;
    }
  }

  async firstUpdated() {
    if (!this.imgSrc) {
      const logoElem = this.shadowRoot!.querySelector('#dd-titlepage-logo');
      (logoElem as HTMLElement)!.style.display = 'none';
    }

    if (this.centerText) {
      this.style.setProperty('--titlepage-align-lsec', 'center');
      this.style.setProperty('--titlepage-padding-left', '0px');
      this.style.setProperty('--titlepage-padding-right', '0px');
      this.style.setProperty('--titlepage-w-left', '100%');
    }

    if (this.centerImg) {
      /*
        const _getWidth:any = async () => {
          await timeout(50);
          const imgWidth = (this.shadowRoot!.querySelector("#dd-titlepage-logo img") as HTMLImageElement).clientWidth;
          if ( imgWidth === 0 )
            return _getWidth();
          return imgWidth;
        }
        const imgWidth = await _getWidth();
        this.style.setProperty("--titlepage-logo-left", `calc( 50% - ${imgWidth/2}px )`);
        */

      /* c8 ignore next 5 */
      window.addEventListener('load', () => {
        const imgWidth = (
          this.shadowRoot!.querySelector(
            '#dd-titlepage-logo img'
          ) as HTMLImageElement
        ).clientWidth;
        this.style.setProperty(
          '--titlepage-logo-left',
          `calc( 50% - ${imgWidth / 2}px )`
        );
      });
    }
  }

  render() {
    let htmlContent = '';

    this.title = 'Titlepage';

    if (this.configPath) this.setPropsFromJson();

    // add slide class
    this.classList.add('slide');
    this.classList.add('titlepage');

    if (this.fromSelector) this.injectFromSelector();

    if (!this.noDefaultMap) this.mapDefault();

    // slot for custom caption
    htmlContent += this.makeTitlePage();

    return html`${unsafeHTML(htmlContent)}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dd-titlepage': DdTitlepage;
  }
}
