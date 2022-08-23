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
  widthLeft: '100%',
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

/**
 * Main class for HTML web component **`dd-titlepage`**
 *
 * For **styling** this component, check out {@link DdTitlepage.styles |
 * the styles section}.
 *
 * <u>**Important note**</u>: all lit-component properties (interpreted here as
 * `other properties`) that are documented here have a **corresponding
 * HTML attribute**. The _non-attribute_ properties are consired private,
 * and are ingored in the documentation.
 *
 * @example
 * A simple titlepage
 *
 * ```html
 * <html>
 *   [...]
 *   <dd-titlepage main-title="MyTitle"
 *                 sub-title="And My SubTitle"
 *                 date="2022-07-12"
 *                 author="Senne Van Baelen and Gerben Peeters"
 *                 organisation="Digital Dasein"
 *                 img-src="./assets/img/logo.jpeg">
 *   </dd-titlepage>
 *   [...]
 * </html>
 * ```
 *
 * An interesting feature of `dd-titlepage` inside the `dd-component`
 * ecosystem, is that it can inherit attributes from a HTML selector
 * with the {@link DdTitlepage.fromSelector | `from-selector` attribute}
 * (defaults to `dd-slide-collection`). For example to obtain the exact same
 * titlepage as in the last example, but now inherit from the
 * `dd-slide-collection` element:
 *
 * ```html
 * <html>
 *   [...]
 *   <dd-slide-collection main-title="MyTitle"
 *                        sub-title="And My SubTitle"
 *                        date="2022-07-12"
 *                        author="Senne Van Baelen and Gerben Peeters"
 *                        organisation="Digital Dasein"
 *                        img-src="./assets/img/logo.jpeg"
 *                        ... (other attr)>
 *      <dd-titlepage></dd-titlepage>
 *      <!--
 *      which is the equivalent for:
 *      <dd-titlepage from-selector="dd-slide-collection"></dd-titlepage>
 *      -->
 *   </dd-slide-collection>
 *   [...]
 * </html>
 * ```
 *
 */

export class DdTitlepage extends LitElement {
  /**
   * To style the `dd-titlepage` component, use the following **CSS host
   * variables** (including their default values):
   *
   * The titlepage is divided into a 3 x 2 grid, with corresponding styling
   * vars for top, middle, and bottom. By default, the width of the first
   * column is 100%, so technically, the grid is 3 x 1 in this case (can be
   * adjusted).
   *
   * |  <div style="width:200px">CSS variable</div>   | <div style="width:130px">Default</div>   | Description |
   * |:-----------------------------------------------|:-----------------------------------------|:------------|
   * |**`--dd-titlepage-color-fg-top`** | var(--dd-color-text)      | foreground color (text) top segment         |
   * |**`--dd-titlepage-color-bg-top`** | var(--dd-color-sec)       | background color  top segment               |
   * |**`--dd-titlepage-color-fg-mid`** | var(--dd-color-text-light)| foreground  color (text)  middle segment    |
   * |**`--dd-titlepage-color-bg-mid`** | var(--dd-color-prim)      | background color  middle segment            |
   * |**`--dd-titlepage-color-fg-bot`** | var(--dd-color-text)      | foreground color (text) bottom segment      |
   * |**`--dd-titlepage-color-bg-bot`** | var(--dd-color-sec)       | background color bottom segment             |
   * |**`--dd-slide-ratio`**       |`calc(16/9)`                | slide aspect ratio                                                                        |
   * |**`--dd-slide-width`**       |`1024px`                    | slide width (this, together with`--dd-slide-ratio` determines the slide height)           |
   * |**`--dd-font`**              |`24px/2 'Roboto', sans-serif`| font style                                                                               |
   * |**`--dd-titlepage-padding-side`**     |`50px`    | content padding from the side            |
   * |**`--dd-titlepage-padding-top-top`**  |`10px`    | content top-padding for the top row      |
   * |**`--dd-titlepage-padding-mid-top`**  |`100px`   | content top-padding for the middel row   |
   * |**`--dd-titlepage-padding-bot-top`**  |`10px`    | content top-padding for the bottom row   |
   * |**`--dd-titlepage-align-lsec`**  |`left`     | align left section of titlepage (options: [left, right, or center])                 |
   * |**`--dd-titlepage-align-rsec`**  |`right`    | align right section of titlepage (options: [left, right, or center])                |
   * |**`--dd-titlepage-w-left`**      |`100%`     | width of the left column (remember, 3x2 grid, by default, left column is full width). Can also be set {@link DdTitlepage.widthLeft | `width-left` attribute}. |
   * |**`--dd-titlepage-h-top`**       |`calc(0.15 * var(--slide-height)`    | height of the top row                                     |
   * |**`--dd-titlepage-h-middle`**    |`var(--slide-height) - var(--titlepage-h-top) - var(--titlepage-h-bottom)`  | height of the middle row |
   * |**`--dd-titlepage-h-bottom`**    |`calc(0.2 * var(--slide-height)`    | height of the bottom row |
   * |**`--dd-titlepage-font-size`**         |`24px`                                           | fontsize for default titlepage text |
   * |**`--dd-titlepage-title-font-size`**   |`calc(2.15 * var(--titlepage-font-size))`        | fontsize title |
   * |**`--dd-titlepage-subtitle-font-size`**|`calc(0.6 * var(--titlepage-title-font-size))`   | fontsize subtitle |
   * |**`--dd-titlepage-logo-height`**       |`calc(var(--titlepage-h-top) / 1.3)`             | height of the titlepage logo/image |
   * |**`--dd-titlepage-logo-top`**          |`calc(var(--titlepage-h-top) - var(--titlepage-logo-height) / 2)`             | titlepage top padding for logo/image |
   * |**`--dd-titlepage-logo-left`**         |`var(--titlepage-padding-side)`                  | titlepage left padding for logo/image |
   *
   * The variables can be set anywhere in your HTML context (e.g. in `:root`,
   * up until the `dd-titlepage` component itself).
   *
   *
   */

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
      --dd-titlepage-color-fg-top: var(--dd-color-text)
      --dd-titlepage-color-bg-top: var(--dd-color-sec)
      --dd-titlepage-color-fg-mid: var(--dd-color-text-light)
      --dd-titlepage-color-bg-mid: var(--dd-color-prim)
      --dd-titlepage-color-fg-bot: var(--dd-color-text)
      --dd-titlepage-color-bg-bot: var(--dd-color-sec)
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
      background-color: var(--dd-titlepage-color-bg-top);
      color: var(--dd-titlepage-color-fg-top);
      padding: var(--titlepage-padding-sectop);
    }

    .dd-titlepage-middle {
      max-height: var(--titlepage-h-middle);
      background-color: var(--dd-titlepage-color-bg-mid);
      color: var(--dd-titlepage-color-fg-mid);
      padding: var(--titlepage-padding-secmid);
    }

    .dd-titlepage-bottom {
      padding: var(--titlepage-padding-secbot);
      background-color: var(--dd-titlepage-color-bg-bottom);
      color: var(--dd-titlepage-color-bg-bott);
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
      /*color: var(--dd-titlepage-color-text)*/
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

  /**
   * Image source
   *
   * **Corresponding attribute:** `img-src`
   *
   * **Default value:** `""` (empty string)
   */
  @property({ type: String, attribute: 'img-src' })
  imgSrc = DEFAULT_ATTRIBUTES.imgSrc;

  /**
   * Main title
   *
   * **Corresponding attribute:** `main-title`
   *
   * **Default value:** `""` (empty string)
   */
  @property({ type: String, attribute: 'main-title' })
  mainTitle = DEFAULT_ATTRIBUTES.mainTitle;

  /**
   * Subtitle
   *
   * **Corresponding attribute:** `sub-title`
   *
   * **Default value:** `""` (empty string)
   */
  @property({ type: String, attribute: 'sub-title' })
  subTitle = DEFAULT_ATTRIBUTES.subTitle;

  /**
   * Author
   *
   * **Corresponding attribute:** `author`
   *
   * **Default value:** `""` (empty string)
   */
  @property({ type: String, attribute: 'author' })
  author = DEFAULT_ATTRIBUTES.author;

  /**
   * Name of organisation
   *
   * **Corresponding attribute:** `organisation`
   *
   * **Default value:** `""` (empty string)
   */

  @property({ type: String, attribute: 'organisation' })
  organisation = DEFAULT_ATTRIBUTES.organisation;

  /**
   * Hyperlink to organisation
   *
   * **Corresponding attribute:** `organisation-url`
   *
   * **Default value:** `""` (empty string)
   */
  @property({ type: String, attribute: 'organisation-url' })
  organisationUrl = DEFAULT_ATTRIBUTES.organisationUrl;

  /**
   * Date
   *
   * **Corresponding attribute:** `date`
   *
   * **Default value:** `""` (empty string)
   */
  @property({ type: String, attribute: 'date' })
  date = DEFAULT_ATTRIBUTES.date;

  /**
   * Maps titlepage content to default style (see demo)
   *
   * **Corresponding attribute:** `no-default-map`
   *
   * **Default value:** `false`
   */
  @property({ type: Boolean, attribute: 'no-default-map' })
  noDefaultMap = DEFAULT_ATTRIBUTES.noDefaultMap;

  /**
   * Boolean for centering all text
   *
   * **Corresponding attribute:** `center-text`
   *
   * **Default value:** `false`
   */
  @property({ type: Boolean, attribute: 'center-text' })
  centerText = DEFAULT_ATTRIBUTES.centerText;

  /**
   * Boolean for centering the image/logo
   *
   * **Corresponding attribute:** `center-text`
   *
   * **Default value:** `false`
   */
  @property({ type: Boolean, attribute: 'center-img' })
  centerImg = DEFAULT_ATTRIBUTES.centerImg;

  /**
   * Path to JSON config file (corresponding inline attributes will
   * **overwrite** attributes defined in JSON config
   *
   * **Corresponding attribute:** `config-path`
   *
   * **Default value:** `""` (empty string)
   */
  @property({ type: String, attribute: 'config-path' })
  configPath = DEFAULT_ATTRIBUTES.configPath;

  /**
   * HTML selector from which you want to inherit relevant attributes.
   * Setting the same attributes on `dd-titlepage` itself will overwrite
   * potentially inherited values.
   *
   * **Corresponding attribute:** `from-selector`
   *
   * **Default value:** `dd-slide-collection`
   */
  @property({ type: String, attribute: 'from-selector' })
  fromSelector = DEFAULT_ATTRIBUTES.fromSelector;

  /**
   * Custom HTML string for non-default top-left cell (3x2 grid)
   *
   * **Corresponding attribute:** `html-top-left`
   *
   * **Default value:** `""` (empty string)
   */
  @property({ type: String, attribute: 'html-top-left' })
  htmlTopLeft = DEFAULT_ATTRIBUTES.htmlTopLeft;

  /**
   * Custom HTML string for non-default top-right cell (3x2 grid)
   *
   * **Corresponding attribute:** `html-top-right`
   *
   * **Default value:** `""` (empty string)
   */
  @property({ type: String, attribute: 'html-top-right' })
  htmlTopRight = DEFAULT_ATTRIBUTES.htmlTopRight;

  /**
   * Custom HTML string for non-default mid-left cell (3x2 grid)
   *
   * **Corresponding attribute:** `html-mid-left`
   *
   * **Default value:** `""` (empty string)
   */
  @property({ type: String, attribute: 'html-mid-left' })
  htmlMidLeft = DEFAULT_ATTRIBUTES.htmlMidLeft;

  /**
   * Custom HTML string for non-default mid-right cell (3x2 grid)
   *
   * **Corresponding attribute:** `html-mid-right`
   *
   * **Default value:** `""` (empty string)
   */
  @property({ type: String, attribute: 'html-mid-right' })
  htmlMidRight = DEFAULT_ATTRIBUTES.htmlMidRight;

  /**
   * Custom HTML string for non-default bottom-left cell (3x2 grid)
   *
   * **Corresponding attribute:** `html-bot-left`
   *
   * **Default value:** `""` (empty string)
   */
  @property({ type: String, attribute: 'html-bot-left' })
  htmlBotLeft = DEFAULT_ATTRIBUTES.htmlBotLeft;

  /**
   * Custom HTML string for non-default bottom-right cell (3x2 grid)
   *
   * **Corresponding attribute:** `html-bot-right`
   *
   * **Default value:** `""` (empty string)
   */
  @property({ type: String, attribute: 'html-bot-right' })
  htmlBotRight = DEFAULT_ATTRIBUTES.htmlBotRight;

  /**
   * Width of the left column (remember, 3x2 grid). Has priority _over_ the CSS
   * variable `--dd-titlepage-w-left`.
   *
   * **Corresponding attribute:** `width-left`
   *
   * **Default value:** `""` (empty string)
   */
  @property({ type: String, attribute: 'width-left' })
  widthLeft = DEFAULT_ATTRIBUTES.widthLeft;

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

  private _mapDefault() {
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

    if (this.widthLeft !== DEFAULT_ATTRIBUTES.widthLeft)
      this.style.setProperty('--titlepage-w-left', this.widthLeft);

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

      /* c8 ignore next 11 */
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

    if (!this.noDefaultMap) this._mapDefault();

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
