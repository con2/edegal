import type { Translations } from "./en";

const translations: Translations = {
  AlbumView: {
    unknownYear: "Tuntematon vuosi",
  },
  BreadcrumbBar: {
    downloadAlbumLink: "Lataa albumi",
    aboutPhotographerLink: "Tietoja valokuvaajasta",
    photographers: "Valokuvaajat",
    timeline: "Aikajana",
  },
  AlbumViewFooter: {
    albumCopyright: "Albumi",
  },
  AppBar: {
    adminLink: "Hallinta",
    photographers: "Valokuvaajat",
    randomPicture: "Satunnainen kuva",
  },
  DownloadAlbumDialog: {
    dialogTitle: "Lataa albumi",
    termsAndConditions:
      "Käyttääksesi näitä kuvia sinun tulee hyväksyä seuraavat ehdot:",
    contact:
      "Jos aiottu käyttö ei ole edellä mainittujen ehtojen mukaista, sovi käytöstä kuvaajan kanssa:",
    creditInstructions:
      "Kun käytät näitä kuvia, ilmoita tekijän/tekijöiden nimi seuraavasti:",
    closeButtonText: "Sulje",
    downloadButtonText: "Lataa albumi",
    preparingDownloadButtonText: "Latausta valmistellaan",
    twitterCredit:
      "Jos käytät näitä kuvia Twitterissä, ilmoita tekijä seuraavasti:",
    instagramCredit:
      "Jos käytät näitä kuvia Instagramissa, ilmoita tekijä seuraavasti:",
    genericCredit:
      "Jos käytät näitä kuvia muualla, ilmoita tekijä seuraavasti:",
    genericCreditAlternative: "Ilmoita tekijä seuraavasti:",
    photographer: "Kuvaaja",
    director: "Ohjaaja",
    acceptTermsAndConditions: "Hyväksyn ehdot",
    defaultTerms:
      "Albumin käyttöehdot puuttuvat. Kuva on tästä huolimatta tekijänoikeuden suojaama. Ellet ole varma, että kuvaaja hyväksyy aiotun käytön, ota yhteyttä kuvaajaan ja kysy lupaa kuvien käyttöön.",
    contactPhotographer: "Ota yhteyttä valokuvaajaan",
  },
  DownloadDialog: {
    dialogTitle: "Lataa alkuperäinen kuva",
    termsAndConditions:
      "Käyttääksesi tätä kuvaa sinun tulee hyväksyä seuraavat ehdot:",
    contact:
      "Jos aiottu käyttö ei ole edellä mainittujen ehtojen mukaista, sovi käytöstä kuvaajan kanssa:",
    creditInstructions:
      "Kun käytät kuvaa, ilmoita tekijän/tekijöiden nimi seuraavasti:",
    closeButtonText: "Sulje",
    downloadButtonText: "Avaa alkuperäinen kuva",
    twitterCredit:
      "Jos käytät tätä kuvaa Twitterissä, ilmoita tekijä seuraavasti:",
    instagramCredit:
      "Jos käytät tätä kuvaa Instagramissa, ilmoita tekijä seuraavasti:",
    genericCredit: "Jos käytät tätä kuvaa muualla, ilmoita tekijä seuraavasti:",
    genericCreditAlternative: "Ilmoita tekijä seuraavasti:",
    photographer: "Kuvaaja",
    director: "Ohjaaja",
    acceptTermsAndConditions: "Hyväksyn ehdot",
    defaultTerms:
      "Kuvan käyttöehdot puuttuvat. Kuva on tästä huolimatta tekijänoikeuden suojaama. Ellet ole varma, että kuvaaja hyväksyy aiotun käytön, ota yhteyttä kuvaajaan ja kysy lupaa kuvan käyttöön.",
    contactPhotographer: "Ota yhteyttä valokuvaajaan",
    preparingDownloadButtonText: null,
  },
  ContactDialog: {
    closeButtonText: "Sulje",
    dialogTitle: "Ota yhteyttä valokuvaajaan",
    sendingContactText: "Lähetetään",
    sendContactText: "Lähetä",
    errorText: "Viestin lähettäminen epäonnistui. Yritä myöhemmin uudelleen.",
    successText: "Viestisi on lähetetty.",
    fields: {
      subject: {
        title: "Aihe",
        choices: {
          takedown: "Olen tässä kuvassa ja haluan, että se poistetaan",
          permission: "Haluaisin käyttää tätä kuvaa",
          other: "Muu",
        },
      },
      recipient: {
        title: "Vastaanottaja",
      },
      email: {
        title: "Sähköpostiosoitteesi",
      },
      album: {
        title: "Albumi",
      },
      picture: {
        title: "Kuva",
      },
      message: {
        title: "Viesti",
      },
    },
  },
  ErrorBoundary: {
    defaultMessage:
      "Albumin lataus epäonnistui. Todennäköisesti albumia ei ole olemassa tai sinulla ei ole käyttöoikeutta siihen.",
  },
  LarppikuvatProfile: {
    contact: "Miten saat minuun yhteyden?",
    hours: "Millaista työmäärää minulta voi odottaa larppia kuvatessani?",
    delivery_schedule:
      "Millaisella aikataululla toimitan tyypillisesti valmiit kuvat?",
    delivery_practice:
      "Miten toimitan valmiit kuvat pelin osallistujille ja millaista karanteenia sovellan?",
    delivery_method: "Miten julkaisen valmiit kuvat suurelle yleisölle?",
    copy_protection:
      "Mitä kuvillani saa tehdä ja millaisia kopiosuojauksia käytän?",
    expected_compensation: "Millaista korvausta odotan larppikuvauksesta?",
  },
  PictureView: {
    backToAlbum: "Takaisin albumiin",
    downloadOriginal: "Lataa alkuperäinen kuva",
    nextPicture: "Seuraava kuva",
    previousPicture: "Edellinen kuva",
  },
};

export default translations;
