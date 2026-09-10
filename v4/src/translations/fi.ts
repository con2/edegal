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
    profile: "Profiili",
    adminLink: "Hallinta",
    photographers: "Valokuvaajat",
    randomPicture: "Satunnainen kuva",
  },
  DownloadAlbumDialog: {
    dialogTitle: "Lataa albumi",
    termsAndConditions:
      "Käyttääksesi näitä kuvia sinun tulee hyväksyä seuraavat ehdot:",
    closeButtonText: "Sulje",
    downloadButtonText: "Lataa albumi",
    twitterCredit:
      "Jos käytät näitä kuvia Twitterissä, ilmoita tekijä seuraavasti:",
    instagramCredit:
      "Jos käytät näitä kuvia Instagramissa, ilmoita tekijä seuraavasti:",
    threadsCredit:
      "Jos käytät näitä kuvia Threadsissä, ilmoita tekijä seuraavasti:",
    blueskyCredit:
      "Jos käytät näitä kuvia Blueskyssa, ilmoita tekijä seuraavasti:",
    genericCredit:
      "Jos käytät näitä kuvia muualla, ilmoita tekijä seuraavasti:",
    genericCreditAlternative: "Ilmoita tekijä seuraavasti:",
    photographer: "Kuvaaja",
    director: "Ohjaaja",
    acceptTermsAndConditions: "Hyväksyn ehdot",
    defaultTerms:
      "Albumin käyttöehdot puuttuvat. Kuva on tästä huolimatta tekijänoikeuden suojaama. Ellet ole varma, että kuvaaja hyväksyy aiotun käytön, ota yhteyttä kuvaajaan ja kysy lupaa kuvien käyttöön.",
  },
  DownloadDialog: {
    dialogTitle: "Lataa alkuperäinen kuva",
    termsAndConditions:
      "Käyttääksesi tätä kuvaa sinun tulee hyväksyä seuraavat ehdot:",
    closeButtonText: "Sulje",
    downloadButtonText: "Avaa alkuperäinen kuva",
    twitterCredit:
      "Jos käytät tätä kuvaa Twitterissä, ilmoita tekijä seuraavasti:",
    instagramCredit:
      "Jos käytät tätä kuvaa Instagramissa, ilmoita tekijä seuraavasti:",
    threadsCredit:
      "Jos käytät tätä kuvaa Threadsissä, ilmoita tekijä seuraavasti:",
    blueskyCredit:
      "Jos käytät tätä kuvaa Blueskyssa, ilmoita tekijä seuraavasti:",
    genericCredit: "Jos käytät tätä kuvaa muualla, ilmoita tekijä seuraavasti:",
    genericCreditAlternative: "Ilmoita tekijä seuraavasti:",
    photographer: "Kuvaaja",
    director: "Ohjaaja",
    acceptTermsAndConditions: "Hyväksyn ehdot",
    defaultTerms:
      "Kuvan käyttöehdot puuttuvat. Kuva on tästä huolimatta tekijänoikeuden suojaama. Ellet ole varma, että kuvaaja hyväksyy aiotun käytön, ota yhteyttä kuvaajaan ja kysy lupaa kuvan käyttöön.",
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
  LanguageSwitcher: {
    // NOTE: value always in the target language
    switchTo: {
      fi: "suomeksi",
      en: "In English",
    },
  },
  Auth: {
    signIn: "Kirjaudu sisään",
    signOut: "Kirjaudu ulos",
    signedInAs: "Kirjautuneena",
  },
  PhotographerProfile: {
    photo: "Kuva:",
  },
  Album: {
    editInLegacyAdmin: "Muokkaa vanhassa hallinnassa",
    hidden: "Piilotettu",
    private: "Yksityinen",
  },
  Errors: {
    notFound:
      "Pahoittelut, pyytämääsi sivua ei löytynyt. Joko albumia ei ole, sinulla ei ole oikeutta katsella sitä tai yhteydessä on ongelma.",
    errorTitle: "Jokin meni pieleen",
  },
  Download: {
    links: "Kuvaajan linkit",
    termsUrl: "Ehdot kokonaisuudessaan",
  },
  Editor: {
    newSubalbum: "Uusi albumi",
    newAlbumTitle: "Uusi albumi",
    editAlbumTitle: "Muokkaa albumia",
    uploadPhotos: "Lähetä kuvia",
    editAlbum: "Muokkaa albumia",
    deleteAlbum: "Poista albumi",
    sortPhotos: "Järjestä kuvat",
    sortByCaptureTime: "Kuvausajan mukaan",
    sortByFilename: "Tiedostonimen numeron mukaan",
    setAsThumbnail: "Käytä albumin kansikuvana",
    setAsProfilePhoto: "Käytä profiilikuvanani",
    deletePhoto: "Poista kuva",
    confirmDeletePhoto: "Poistetaanko tämä kuva pysyvästi?",
    photoActions: "Kuvan toiminnot",
    save: "Tallenna",
    create: "Luo albumi",
    cancel: "Peruuta",
    fields: {
      parent: "Yläalbumi",
      parentHelp: "Uusi albumi luodaan tämän albumin alle.",
      title: "Otsikko",
      slug: "Osoitetunnus",
      slugHelp:
        "Osa osoitetta. Pieniä kirjaimia, numeroita ja viivoja. Tyhjänä muodostetaan otsikosta. Muuttaminen jälkikäteen rikkoo vanhat linkit.",
      eventDate: "Tapahtuman päivä",
      eventDateHelp: "Alialbumit järjestetään uusin ensin tämän päivän mukaan.",
      visibility: "Näkyvyys",
      visibilityPublic: "Julkinen",
      visibilityPublicHelp: "Näkyy yläalbuminsa alialbumilistassa.",
      visibilityHidden: "Piilotettu",
      visibilityHiddenHelp:
        "Ei näy yläalbumissa, mutta kuka tahansa osoitteen tietävä voi katsella albumia.",
      visibilityPrivate: "Yksityinen",
      visibilityPrivateHelp: "Vain sinä ja ylläpitäjät näkevät sen.",
      openForSubalbums: "Avoin muiden kuvaajien alialbumeille",
      openForSubalbumsHelp:
        "Kuka tahansa kuvaaja voi luoda tämän albumin alle omia alialbumeja ja ladata niihin kuvia. Tyypillistä tapahtuman pääalbumille. Jätä pois omista albumeistasi.",
      isDownloadable:
        "Vierailijat voivat ladata alkuperäiset kuvat ja koko albumin",
      ordering: "Järjestysnumero",
      orderingHelp:
        "Pienemmän numeron alialbumit ensin; samat numerot järjestetään päivän mukaan.",
      eventMetadataUrl: "Tapahtuman sivu",
      eventMetadataUrlHelp:
        "Tapahtuman osoite Kompassissa tai Larpit.fi:ssä. Aseta vain tapahtuman pääalbumille.",
      body: "Kuvaus",
      terms: "Käyttöehdot",
      termsInherit: "Samat kuin yläalbumissa",
      termsNone: "Ei mitään",
      manageTerms: "Hallitse käyttöehtojasi profiilissasi.",
      credits: "Tekijät",
      creditsHelp:
        "Kuka otti kuvat tai muuten osallistui. Tekijänoikeuden haltija mainitaan alatunnisteessa.",
      creditPhotographer: "Kuvaaja",
      creditCopyright: "Tekijänoikeuden haltija",
      creditDescription: "Rooli (valinnainen)",
      addCredit: "Lisää tekijä",
      removeCredit: "Poista",
      owner: "Omistaja",
    },
    deleteConfirm: {
      title: "Poista albumi",
      warning:
        "Tämä poistaa albumin, kaikki sen alialbumit ja kuvat sekä tiedostot. Toimintoa ei voi perua.",
      counts: "Poistettavat alialbumit / kuvat",
      typeSlug: "Kirjoita albumin osoitetunnus vahvistukseksi",
      confirm: "Poista pysyvästi",
    },
    processing: "kuvaa käsitellään ja ne ilmestyvät pian",
    errors: {
      pathTaken: "Tässä osoitteessa on jo albumi tai kuva.",
      forbidden: "Sinulla ei ole oikeutta tähän.",
      invalid: "Tarkista lomake.",
    },
    success: {
      albumSaved: "Albumi tallennettu.",
      photosSorted: "Kuvat järjestetty.",
      thumbnailSet: "Albumin kansikuva vaihdettu.",
      photoDeleted: "Kuva poistettu.",
      albumDeleted: "Albumi poistettu.",
    },
  },
  Upload: {
    processingSuffix: "kuvaa käsitellään; ne ilmestyvät pian…",
    title: "Lähetä kuvia tähän albumiin",
    help: "JPEG, PNG tai WebP, enintään 100 Mt per tiedosto. Esikatselukuvat tehdään taustalla lähetyksen jälkeen. Kuvat järjestetään kuvausajan mukaan.",
    dropHere: "Pudota kuvat tähän tai",
    selectFiles: "valitse tiedostot",
    waiting: "Odottaa",
    uploading: "Lähetetään",
    done: "Valmis",
    failed: "Epäonnistui",
    retry: "Yritä epäonnistuneita uudelleen",
    clear: "Tyhjennä valmiit",
    errors: {
      tooLarge: "Yli 100 Mt",
      unsupported: "Ei JPEG-, PNG- tai WebP-kuva (HEIC ei ole tuettu)",
      exists: "Albumissa on jo tämän niminen kuva",
      forbidden: "Ei sallittu",
      network: "Verkkovirhe",
    },
  },
  Profile: {
    title: "Kuvaajaprofiili",
    intro: "Nimesi ja linkkisi näytetään albumiesi tekijätiedoissa.",
    slug: "Osoitetunnus",
    slugHelp:
      "Osa kuvaajasivusi osoitetta (pieniä kirjaimia, numeroita ja viivoja). Muuttaminen jälkikäteen rikkoo vanhat linkit sivullesi.",
    slugTaken: "Tämä osoitetunnus on jo toisen kuvaajan käytössä.",
    displayName: "Näyttönimi",
    email: "Sähköposti (ei näytetä julkisesti)",
    introduction: "Esittely",
    links: "Linkit",
    linkTitle: "Otsikko",
    linkHref: "Osoite",
    addLink: "Lisää linkki",
    removeLink: "Poista",
    defaultTerms: "Uusien albumien oletuskäyttöehdot",
    save: "Tallenna",
    saved: "Profiili tallennettu.",
    photo: {
      title: "Profiilikuva",
      help: "Avaa mikä tahansa kuva galleriassa ja valitse sen valikosta ”Käytä profiilikuvanani”. Kuva saa olla toisen kuvaajan ottama: hänet mainitaan kuvan alla sivullasi.",
      none: "Ei profiilikuvaa.",
      clear: "Poista profiilikuva",
      set: "Profiilikuva vaihdettu.",
      cleared: "Profiilikuva poistettu.",
    },
    terms: {
      title: "Käyttöehtoni",
      help: "Uudelleenkäytettävät tekstit, jotka näytetään vierailijoille ennen kuvien lataamista. Markdown toimii.",
      newTerms: "Uudet käyttöehdot",
      termsTitle: "Nimi (omaan käyttöösi)",
      termsText: "Teksti",
      termsUrl: "Linkki ehtoihin kokonaisuudessaan (valinnainen)",
      create: "Luo",
      update: "Päivitä",
      delete: "Poista",
      confirmDelete:
        "Poistetaanko nämä käyttöehdot? Niitä käyttävät albumit perivät yläalbuminsa ehdot.",
      saved: "Käyttöehdot tallennettu.",
      deleted: "Käyttöehdot poistettu.",
      inUse:
        "Näitä käyttöehtoja käyttävät albumit, joita et omista, eikä niitä voi poistaa.",
    },
  },
  PictureView: {
    backToAlbum: "Takaisin albumiin",
    downloadOriginal: "Lataa alkuperäinen kuva",
    nextPicture: "Seuraava kuva",
    previousPicture: "Edellinen kuva",
  },
};

export default translations;
