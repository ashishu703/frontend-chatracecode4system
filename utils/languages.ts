export const languages = [
    { "name": "Afrikaans", "value": "af" },
    { "name": "Albanian", "value": "sq" },
    { "name": "Arabic", "value": "ar" },
    { "name": "Azerbaijani", "value": "az" },
    { "name": "Bengali", "value": "bn" },
    { "name": "Bulgarian", "value": "bg" },
    { "name": "Catalan", "value": "ca" },
    { "name": "Chinese (CHN)", "value": "zh-CN" },
    { "name": "Chinese (HKG)", "value": "zh-HK" },
    { "name": "Chinese (TAI)", "value": "zh-TW" },
    { "name": "Croatian", "value": "hr" },
    { "name": "Czech", "value": "cs" },
    { "name": "Danish", "value": "da" },
    { "name": "Dutch", "value": "nl" },
    { "name": "English", "value": "en" },
    { "name": "English (UK)", "value": "en-GB" },
    { "name": "English (US)", "value": "en-US" },
    { "name": "Estonian", "value": "et" },
    { "name": "Filipino", "value": "fil" },
    { "name": "Finnish", "value": "fi" },
    { "name": "French", "value": "fr" },
    { "name": "Georgian", "value": "ka" },
    { "name": "German", "value": "de" },
    { "name": "Greek", "value": "el" },
    { "name": "Gujarati", "value": "gu" },
    { "name": "Hausa", "value": "ha" },
    { "name": "Hebrew", "value": "he" },
    { "name": "Hindi", "value": "hi" },
    { "name": "Hungarian", "value": "hu" },
    { "name": "Indonesian", "value": "id" },
    { "name": "Irish", "value": "ga" },
    { "name": "Italian", "value": "it" },
    { "name": "Japanese", "value": "ja" },
    { "name": "Kannada", "value": "kn" },
    { "name": "Kazakh", "value": "kk" },
    { "name": "Kinyarwanda", "value": "rw" },
    { "name": "Korean", "value": "ko" },
    { "name": "Kyrgyz (Kyrgyzstan)", "value": "ky" },
    { "name": "Lao", "value": "lo" },
    { "name": "Latvian", "value": "lv" },
    { "name": "Lithuanian", "value": "lt" },
    { "name": "Macedonian", "value": "mk" },
    { "name": "Malay", "value": "ms" },
    { "name": "Malayalam", "value": "ml" },
    { "name": "Marathi", "value": "mr" },
    { "name": "Norwegian", "value": "no" },
    { "name": "Persian", "value": "fa" },
    { "name": "Polish", "value": "pl" },
    { "name": "Portuguese (BR)", "value": "pt-BR" },
    { "name": "Portuguese (POR)", "value": "pt-PT" },
    { "name": "Punjabi", "value": "pa" },
    { "name": "Romanian", "value": "ro" },
    { "name": "Russian", "value": "ru" },
    { "name": "Serbian", "value": "sr" },
    { "name": "Slovak", "value": "sk" },
    { "name": "Slovenian", "value": "sl" },
    { "name": "Spanish", "value": "es" },
    { "name": "Spanish (ARG)", "value": "es-AR" },
    { "name": "Spanish (SPA)", "value": "es-ES" },
    { "name": "Spanish (MEX)", "value": "es-MX" },
    { "name": "Swahili", "value": "sw" },
    { "name": "Swedish", "value": "sv" },
    { "name": "Tamil", "value": "ta" },
    { "name": "Telugu", "value": "te" },
    { "name": "Thai", "value": "th" },
    { "name": "Turkish", "value": "tr" },
    { "name": "Ukrainian", "value": "uk" },
    { "name": "Urdu", "value": "ur" },
    { "name": "Uzbek", "value": "uz" },
    { "name": "Vietnamese", "value": "vi" },
    { "name": "Zulu", "value": "zu" }
  ]
  
  // Helper functions for languages
  export const getLanguageName = (value: string): string => {
    const language = languages.find(lang => lang.value === value)
    return language ? language.name : value
  }
  
  export const getLanguageValue = (name: string): string => {
    const language = languages.find(lang => lang.name === name)
    return language ? language.value : name
  }
  
  export const getLanguagesByRegion = () => {
    const regions = {
      'Asia': ['zh-CN', 'zh-HK', 'zh-TW', 'ja', 'ko', 'hi', 'bn', 'ta', 'te', 'kn', 'ml', 'mr', 'gu', 'pa', 'th', 'vi', 'id', 'ms', 'fil'],
      'Europe': ['en-GB', 'en-US', 'de', 'fr', 'es', 'es-ES', 'it', 'pt-PT', 'nl', 'pl', 'ru', 'uk', 'tr', 'el', 'hu', 'cs', 'sk', 'hr', 'sl', 'bg', 'ro', 'mk', 'sq', 'et', 'lv', 'lt', 'ka'],
      'Americas': ['en-US', 'es-AR', 'es-MX', 'pt-BR'],
      'Africa': ['ar', 'sw', 'ha', 'zu', 'af', 'rw'],
      'Middle East': ['ar', 'he', 'fa', 'ur', 'az', 'kk', 'ky', 'uz']
    }
    return regions
  }
  
  // Default language
  export const defaultLanguage = { "name": "English", "value": "en" }