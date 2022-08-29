// SPDX-FileCopyrightText: 2022 Digital Dasein <https://digitaldasein.org/>
// SPDX-FileCopyrightText: 2022 Gerben Peeters <gerben@digitaldasein.org>
// SPDX-FileCopyrightText: 2022 Senne Van Baelen <senne@digitaldasein.org>
//
// SPDX-License-Identifier: MIT

import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { DdTitlepage } from '../src/DdTitlepage.js';
import '../src/dd-titlepage.js';

/*---------------------------------------------------------------------*/
/* Config                                                              */
/*---------------------------------------------------------------------*/

/*---------------------------------------------------------------------*/
/* Utils                                                               */
/*---------------------------------------------------------------------*/

function timeout(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/*---------------------------------------------------------------------*/
/* Test                                                                */
/*---------------------------------------------------------------------*/

describe('DdTitlepage', () => {
  it('set properties', async () => {
    const el = await fixture<DdTitlepage>(html` <dd-titlepage
      html-top-left="left"
      html-top-right="right"
      html-mid-left="midleft"
      html-mid-right="midright"
      html-bot-left="botleft"
      html-bot-right="botright"
    >
    </dd-titlepage>`);

    expect(el.htmlTopLeft).to.equal('left');
    expect(el.htmlTopRight).to.equal('right');
    expect(el.htmlMidLeft).to.equal('midleft');
    expect(el.htmlMidRight).to.equal('midright');
    expect(el.htmlBotLeft).to.equal('botleft');
    expect(el.htmlBotRight).to.equal('botright');
  });

  it('set properties from default map', async () => {
    const el = await fixture<DdTitlepage>(html` <dd-titlepage
      main-title="mytitle"
    >
    </dd-titlepage>`);
    expect(el.htmlMidLeft).to.include('mytitle');
  });

  it('center content, including logo image', async () => {
    await fixture<DdTitlepage>(html` <dd-titlepage
      title="MyTitle"
      subtitle="And My SubTitle"
      date="2022-07-12"
      author="Senne Van Baelen and Gerben Peeters"
      organisation="Digital Dasein"
      organisation-url="http://myorg.org"
      center-text
      center-img
      img-src="logo.jpeg"
    >
    </dd-titlepage>`);
  });

  it('Get config from JSON file', async () => {
    const response = await fetch('./test/config.json');
    const jsonConfig = await response.json();

    const el = await fixture<DdTitlepage>(html`
      <dd-titlepage config-path="/test/config.json"></dd-titlepage>
    `);

    // wait to make sure data is fetched
    await timeout(100);
    const titlepageTitle = el.shadowRoot!.querySelector(
      '.dd-titlepage-title'
    )!.innerHTML;
    expect(titlepageTitle).to.include(jsonConfig.title);
  });

  it('Return error (as title) if JSON file does not exist', async () => {
    const el = await fixture<DdTitlepage>(html`
      <dd-titlepage config-path="/test/nonconfig.json"></dd-titlepage>
    `);
    // wait to make sure data is fetched
    await timeout(100);

    const titlepageTitle = el.shadowRoot!.querySelector(
      '.dd-titlepage-mid-l'
    )!.innerHTML;
    expect(titlepageTitle).to.include('ERROR');
  });

  it('Return error (as textCenter) if JSON cannot be parsed', async () => {
    const el = await fixture<DdTitlepage>(html`
      <dd-titlepage config-path="/test/wrongconfig.json"></dd-titlepage>
    `);
    // wait to make sure data is fetched
    await timeout(100);
    const titlepageTitle = el.shadowRoot!.querySelector(
      '.dd-titlepage-mid-l'
    )!.innerHTML;
    expect(titlepageTitle).to.include('ERROR');
  });

  it('Set width of left column', async () => {
    const el = await fixture<DdTitlepage>(html`
      <dd-titlepage width-left="100px"></dd-titlepage>
    `);
    await timeout(100);
    const wLeft = getComputedStyle(el).getPropertyValue('--titlepage-w-left');
    expect(wLeft).to.equal('100px');
  });

  it('Inject content from selector', async () => {
    await fixture<DdTitlepage>(html`
      <div
        class="my-parent-class"
        main-title="title"
        sub-title="subtitle"
        author="author"
        date="date"
        organisation="myorg"
        organisation-url="http://myorg.org"
        url-logo="http://url.org"
        img-src="test/logo.jpeg"
      >
        <dd-titlepage from-selector=".my-parent-class"></dd-titlepage>
      </div>
    `);

    // not sure how to assert this one, as it seems tricky to get injected DOM
    // this merely covers the functions and branches without any assertion
  });

  it('passes the a11y audit', async () => {
    const el = await fixture<DdTitlepage>(html`
      <dd-titlepage></dd-titlepage>
    `);
    await expect(el).shadowDom.to.be.accessible();
  });
});
