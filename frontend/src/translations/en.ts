const translations = {
  AlbumView: {
    unknownYear: 'Unknown year',
  },
  BreadcrumbBar: {
    downloadAlbumLink: 'Download whole album',
    aboutPhotographerLink: 'About the photographer',
    photographers: 'Photographers',
    timeline: 'Timeline',
  },
  AlbumViewFooter: {
    albumCopyright: 'Album',
  },
  AppBar: {
    adminLink: 'Admin',
    photographers: 'Photographers',
    randomPicture: 'Random picture',
  },
  DownloadAlbumDialog: {
    dialogTitle: 'Download album',
    termsAndConditions:
      'In order to use these pictures, you must agree to the following terms and conditions:',
    contact: 'If your intended use is not covered by the above conditions, please contact:',
    creditInstructions: 'When using these pictures, credit the authors as follows:',
    closeButtonText: 'Close',
    downloadButtonText: 'Download album',
    preparingDownloadButtonText: 'Preparing download',
    twitterCredit: 'If you use these pictures in Twitter, please credit the author as follows:',
    instagramCredit: 'If you use these pictures in Instagram, please credit the author as follows:',
    genericCredit: 'If you use these pictures anywhere else, please credit the author as follows:',
    genericCreditAlternative: 'Please credit the author as follows:',
    photographer: 'Photographer',
    director: 'Director',
    acceptTermsAndConditions: 'I accept these terms and conditions',
    defaultTerms:
      'Terms and conditions missing. These pictures are covered by standard copyright protections, and unless you are certain the photographer will not object to your intended use, you should contact them and ask for permission.',
    contactPhotographer: 'Contact photographer',
  },
  DownloadDialog: {
    dialogTitle: 'Download original photo',
    termsAndConditions: 'In order to use this picture, you must agree to the following terms and conditions:',
    contact: 'If your intended use is not covered by the above conditions, please contact:',
    creditInstructions: 'When using this picture, credit the authors as follows:',
    closeButtonText: 'Close',
    downloadButtonText: 'Open original',
    twitterCredit: 'If you use this picture in Twitter, please credit the author as follows:',
    instagramCredit: 'If you use this picture in Instagram, please credit the author as follows:',
    genericCredit: 'If you use this picture anywhere else, please credit the author as follows:',
    genericCreditAlternative: 'Please credit the author as follows:',
    photographer: 'Photographer',
    director: 'Director',
    acceptTermsAndConditions: 'I accept these terms and conditions',
    defaultTerms:
      'Terms and conditions missing. The photo is covered by standard copyright protections, and unless you are certain the photographer will not object to your intended use, you should contact them and ask for permission.',
    contactPhotographer: 'Contact photographer',
  },
  ContactDialog: {
    closeButtonText: 'Close',
    dialogTitle: 'Contact photographer',
    sendingContactText: 'Sending',
    sendContactText: 'Send',
    errorText: 'We were unable to send your message. Please try again later.',
    successText: 'Your message has been sent.',
    fields: {
      subject: {
        title: 'Subject',
        choices: {
          takedown: 'I am in this photo and I want it removed',
          permission: "I'd like to ask for permission to use this photo",
          other: 'Other',
        },
      },
      recipient: {
        title: 'Recipient',
      },
      email: {
        title: 'Your email address',
      },
      album: {
        title: 'Album',
      },
      picture: {
        title: 'Picture',
      },
      message: {
        title: 'Message',
      },
    },
  },
  ErrorBoundary: {
    defaultMessage:
      'Something went wrong while loading the album. It is likely that either the album does not exist, you are not authorized to view it or there is a connectivity problem.',
  },
  LarppikuvatProfile: {
    contact: 'How can I be contacted?',
    hours: 'What amount of hours can I be expected to work while photographing a LARP?',
    delivery_schedule: 'What is my typical delivery schedule for finished photos?',
    delivery_practice:
      'How will I deliver finished photos to participants and what are the quarantine rules used?',
    delivery_method: 'How will I publish finished photos to the general public?',
    copy_protection: 'What can you do with my photos and what kind of protections are applied?',
    expected_compensation: 'What kind of compensation do I expect for LARP photography?',
  },
  PictureView: {
    backToAlbum: 'Back to Album',
    downloadOriginal: 'Download Original',
    nextPicture: 'Next Picture',
    previousPicture: 'Previous Picture',
  },
};

export default translations;
