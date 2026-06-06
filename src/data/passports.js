
export const passportImages = {
  'United States': '/passports/USA Passport.png',
  Canada: '/passports/Canada Passport.png',
  Mexico: '/passports/Mexico Passport.png',
  'United Kingdom': '/passports/United Kingdom Passport.png',
  Germany: '/passports/Germany Passport.png',
  Netherlands: '/passports/Netherlands Passport.png',
  Belgium: '/passports/Belgium Passport.png',
  France: '/passports/France Passport.png',
  Japan: '/passports/Japan Passport.png',
  Brazil: '/passports/Brazil Passport.png',
  Australia: '/passports/Australia Passport.png',
}

export const countries = Object.keys(passportImages)

export function getPassportImage(country) {
  return passportImages[country] || '/edm-passport-logo.png'
}
