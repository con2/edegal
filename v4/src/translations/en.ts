const translations = {
  AlbumView: {
    unknownYear: "Unknown year",
  },
  BreadcrumbBar: {
    downloadAlbumLink: "Download whole album",
    aboutPhotographerLink: "About the photographer",
    photographers: "Photographers",
    timeline: "Timeline",
  },
  AlbumViewFooter: {
    albumCopyright: "Album",
  },
  AppBar: {
    profile: "Profile",
    adminLink: "Admin",
    photographers: "Photographers",
    randomPicture: "Random picture",
  },
  DownloadAlbumDialog: {
    dialogTitle: "Download album",
    termsAndConditions:
      "In order to use these pictures, you must agree to the following terms and conditions:",
    closeButtonText: "Close",
    downloadButtonText: "Download album",
    twitterCredit:
      "If you use these pictures in Twitter, please credit the author as follows:",
    instagramCredit:
      "If you use these pictures in Instagram, please credit the author as follows:",
    threadsCredit:
      "If you use these pictures in Threads, please credit the author as follows:",
    blueskyCredit:
      "If you use these pictures in Bluesky, please credit the author as follows:",
    genericCredit:
      "If you use these pictures anywhere else, please credit the author as follows:",
    genericCreditAlternative: "Please credit the author as follows:",
    photographer: "Photographer",
    director: "Director",
    acceptTermsAndConditions: "I accept these terms and conditions",
    defaultTerms:
      "Terms and conditions missing. These pictures are covered by standard copyright protections, and unless you are certain the photographer will not object to your intended use, you should contact them and ask for permission.",
  },
  DownloadDialog: {
    dialogTitle: "Download original photo",
    termsAndConditions:
      "In order to use this picture, you must agree to the following terms and conditions:",
    closeButtonText: "Close",
    downloadButtonText: "Open original",
    twitterCredit:
      "If you use this picture in Twitter, please credit the author as follows:",
    instagramCredit:
      "If you use this picture in Instagram, please credit the author as follows:",
    threadsCredit:
      "If you use this picture in Threads, please credit the author as follows:",
    blueskyCredit:
      "If you use this picture in Bluesky, please credit the author as follows:",
    genericCredit:
      "If you use this picture anywhere else, please credit the author as follows:",
    genericCreditAlternative: "Please credit the author as follows:",
    photographer: "Photographer",
    director: "Director",
    acceptTermsAndConditions: "I accept these terms and conditions",
    defaultTerms:
      "Terms and conditions missing. The photo is covered by standard copyright protections, and unless you are certain the photographer will not object to your intended use, you should contact them and ask for permission.",
  },
  ContactDialog: {
    closeButtonText: "Close",
    dialogTitle: "Contact photographer",
    sendingContactText: "Sending",
    sendContactText: "Send",
    errorText: "We were unable to send your message. Please try again later.",
    successText: "Your message has been sent.",
    fields: {
      subject: {
        title: "Subject",
        choices: {
          takedown: "I am in this photo and I want it removed",
          permission: "I'd like to ask for permission to use this photo",
          other: "Other",
        },
      },
      recipient: {
        title: "Recipient",
      },
      email: {
        title: "Your email address",
      },
      album: {
        title: "Album",
      },
      picture: {
        title: "Picture",
      },
      message: {
        title: "Message",
      },
    },
  },
  ErrorBoundary: {
    defaultMessage:
      "Something went wrong while loading the album. It is likely that either the album does not exist, you are not authorized to view it or there is a connectivity problem.",
  },
  LarppikuvatProfile: {
    contact: "How can I be contacted?",
    hours:
      "What amount of hours can I be expected to work while photographing a LARP?",
    delivery_schedule:
      "What is my typical delivery schedule for finished photos?",
    delivery_practice:
      "How will I deliver finished photos to participants and what are the quarantine rules used?",
    delivery_method:
      "How will I publish finished photos to the general public?",
    copy_protection:
      "What can you do with my photos and what kind of protections are applied?",
    expected_compensation:
      "What kind of compensation do I expect for LARP photography?",
  },
  LanguageSwitcher: {
    // NOTE: value always in the target language
    switchTo: {
      fi: "suomeksi",
      en: "In English",
    },
  },
  Auth: {
    signIn: "Sign in",
    signOut: "Sign out",
    signedInAs: "Signed in as",
  },
  PhotographerProfile: {
    photo: "Photo:",
  },
  Album: {
    editInLegacyAdmin: "Edit in old admin",
    hidden: "Hidden",
    private: "Private",
  },
  Errors: {
    notFound:
      "Sorry, the page you requested could not be found. Either the album does not exist, you are not authorized to view it or there is a connectivity problem.",
    errorTitle: "Something went wrong",
  },
  Download: {
    links: "Photographer links",
    termsUrl: "Full terms",
  },
  Editor: {
    newSubalbum: "New album",
    newAlbumTitle: "New album",
    editAlbumTitle: "Edit album",
    uploadPhotos: "Upload photos",
    editAlbum: "Edit album",
    deleteAlbum: "Delete album",
    sortPhotos: "Sort photos",
    sortByCaptureTime: "By capture time",
    sortByFilename: "By filename number",
    useAsThumbnail: "Use as thumbnail",
    thisAlbum: "This album",
    setAsProfilePhoto: "Use as my profile photo",
    deletePhoto: "Delete photo",
    confirmDeletePhoto: "Delete this photo permanently?",
    save: "Save",
    create: "Create album",
    cancel: "Cancel",
    newSeries: "New series",
    newSeriesTitle: "New series",
    editSeries: "Edit series",
    editSeriesTitle: "Edit series",
    deleteSeries: "Delete series",
    createSeries: "Create series",
    fields: {
      parent: "Parent album",
      parentHelp: "The new album is created under this album.",
      parentMoveHelp:
        "Path of the parent album. Type to search and pick a suggestion to move this album, with everything in it, under another album. Only albums you may add to are offered.",
      title: "Title",
      slug: "Slug",
      slugHelp:
        "Part of the address. Lowercase letters, digits and dashes. Left empty, it is derived from the title. Changing it later breaks existing links.",
      eventDate: "Date of event",
      eventDateHelp: "Subalbums are listed newest first by this date.",
      visibility: "Visibility",
      visibilityPublic: "Public",
      visibilityPublicHelp: "Listed and reachable by everyone.",
      visibilityHidden: "Hidden",
      visibilityHiddenHelp:
        "Not listed, but anyone with the address can view it. Its subalbums stay off photographer pages, series and search engines too, even when they are public themselves.",
      visibilityPrivate: "Private",
      visibilityPrivateHelp:
        "Only you and admins can view it, including everything inside it.",
      openForSubalbums: "Open for subalbums by other photographers",
      openForSubalbumsHelp:
        "Any photographer may create their own subalbums under this album and upload photos to them. Typical for the main album of an event. Leave off for your personal albums.",
      isDownloadable: "Visitors may download originals and the whole album",
      layout: "Layout",
      layoutHelp:
        "Yearly groups the subalbums under a heading per year; use it for albums that collect events over time, such as the front page.",
      layoutSimple: "Simple grid",
      layoutYearly: "Grouped by year",
      ordering: "Ordering number",
      orderingHelp:
        "Subalbums with a smaller number come first; equal numbers are ordered by date.",
      eventMetadataUrl: "Event page",
      eventMetadataUrlHelp:
        "Kompassi or Larpit.fi address of the event. Only set this for the main album of the event.",
      body: "Description",
      terms: "Conditions of use",
      termsInherit: "Same as the parent album",
      termsNone: "None",
      manageTerms: "Manage your conditions of use in your profile.",
      credits: "Credits",
      creditsHelp:
        "Who took or otherwise contributed to the photos. The copyright holder is credited in the footer.",
      creditPhotographer: "Photographer",
      creditCopyright: "Copyright holder",
      creditDescription: "Role (optional)",
      addCredit: "Add credit",
      removeCredit: "Remove",
      owner: "Owner",
      series: "Series",
      seriesHelp:
        "A chronological group of albums, such as the runs of a campaign or the years of an event. The series appears in the breadcrumb and links this album to the previous and next one in it. Admins create series on the front page.",
      seriesNone: "Not part of a series",
      seriesSlugHelp:
        "Part of the address, right under the front page. Pick a slug from the suggestions to continue a series that started on the old site.",
      seriesVisibilityPublicHelp: "Listed and reachable by everyone.",
      seriesVisibilityPrivateHelp: "Only admins can view it.",
      description: "Short description",
      descriptionHelp: "One sentence for search engines and link previews.",
      redirectUrl: "Redirect",
      redirectUrlHelp:
        "Visitors opening this album are sent here instead. A web address (https://…) is shown as a link tile in the parent album; a gallery path (/some-album) forwards to that album. Leave empty for a normal album.",
    },
    deleteConfirm: {
      title: "Delete album",
      warning:
        "This deletes the album, all its subalbums and photos, and the files. This cannot be undone.",
      counts: "Subalbums / photos to be deleted",
      typeSlug: "Type the album slug to confirm",
      confirm: "Delete permanently",
    },
    deleteSeriesConfirm: {
      title: "Delete series",
      warning:
        "This deletes the series page. Its albums stay where they are and merely leave the series.",
      counts: "",
      typeSlug: "Type the series slug to confirm",
      confirm: "Delete series",
    },
    processing: "photos are being processed and will appear shortly",
    errors: {
      pathTaken: "An album, series or photo with this address already exists.",
      invalidParent: "The chosen parent album is not available.",
      confirmMismatch: "The slug you typed does not match the album.",
      foreignSubalbums:
        "This album contains albums owned by other photographers. They must delete theirs first, or ask an admin.",
      forbidden: "You do not have permission to do this.",
      invalid: "Please check the form.",
    },
    success: {
      albumSaved: "Album saved.",
      photosSorted: "Photos sorted.",
      thumbnailSet: "Album thumbnail changed.",
      photoDeleted: "Photo deleted.",
      albumDeleted: "Album deleted.",
      seriesSaved: "Series saved.",
      seriesDeleted: "Series deleted.",
    },
  },
  Upload: {
    processingSuffix: "photos are being processed and will appear shortly…",
    title: "Upload photos to this album",
    help: "JPEG, PNG or WebP, at most 100 MB per file. Previews are generated in the background after upload. Photos are ordered by the time they were taken.",
    dropHere: "Drop photos here or",
    selectFiles: "choose files",
    waiting: "Waiting",
    uploading: "Uploading",
    done: "Done",
    failed: "Failed",
    retry: "Retry failed",
    clear: "Clear finished",
    errors: {
      tooLarge: "Larger than 100 MB",
      tooManyPixels: "More than 100 megapixels",
      unsupported: "Not a JPEG, PNG or WebP image (HEIC is not supported)",
      exists: "A photo with this name already exists in the album",
      forbidden: "Not allowed",
      network: "Network error",
    },
  },
  Profile: {
    title: "Photographer profile",
    intro: "Your name and links are shown in the credits of your albums.",
    slug: "Slug",
    slugHelp:
      "Part of your photographer page address (lowercase letters, digits and dashes). Changing it later breaks existing links to that page.",
    slugTaken: "This slug is already in use by another photographer.",
    displayName: "Display name",
    email: "Email (not shown publicly)",
    introduction: "Introduction",
    links: "Links",
    linkTitle: "Title",
    linkHref: "Address",
    addLink: "Add link",
    removeLink: "Remove",
    defaultTerms: "Default conditions of use for new albums",
    save: "Save",
    saved: "Profile saved.",
    photo: {
      title: "Profile photo",
      help: "Open any photo in the gallery and choose “Use as my profile photo” from its menu. A photo taken by someone else is fine: they are credited under it on your page.",
      none: "No profile photo yet.",
      clear: "Remove profile photo",
      set: "Profile photo changed.",
      cleared: "Profile photo removed.",
    },
    terms: {
      title: "My conditions of use",
      help: "Reusable texts shown to visitors before they download your photos. Markdown is supported.",
      newTerms: "New conditions",
      termsTitle: "Name (for your own reference)",
      termsText: "Text",
      termsUrl: "Link to the full terms (optional)",
      create: "Create",
      update: "Update",
      delete: "Delete",
      confirmDelete:
        "Delete these conditions? Albums using them will fall back to their parent's.",
      saved: "Conditions saved.",
      deleted: "Conditions deleted.",
      inUse:
        "These conditions are used by albums you do not own and cannot be deleted.",
    },
  },
  PictureView: {
    backToAlbum: "Back to Album",
    downloadOriginal: "Download Original",
    maximize: "Maximize",
    startSlideshow: "Start slideshow",
    stopSlideshow: "Stop slideshow",
    nextPicture: "Next Picture",
    previousPicture: "Previous Picture",
  },
};

export type Translations = typeof translations;
export default translations;
