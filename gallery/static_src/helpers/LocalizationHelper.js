// XXX hardcoded
const language = 'fi';

var translations = {
  fi: {
    'Picture view, original picture download link': 'Lataa alkuperäinen kuva...',
    'Edegal copyright footer': 'Galleriaohjelmisto <a href="https://github.com/japsu/edegal" target="_blank">Edegal VERSION</a> &copy; 2013&ndash;2015 <a href="https://twitter.com/ssspaju" target="_blank">Santtu Pajukanta</a>.'
  },
  en: {
    'Picture view, original picture download link': 'Download original picture...',
    'Edegal copyright footer': 'Powered by <a href="https://github.com/japsu/edegal" target="_blank">Edegal VERSION</a> &copy; 2013&ndash;2015 <a href="https://twitter.com/ssspaju" target="_blank">Santtu Pajukanta</a>.'
  }
};

export default function translate(key) {
  return translations[language][key];
};
