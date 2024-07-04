/**
 * Make valid url
 * @param {string} urlString
 * @returns {string}
 */
export const toUrl = (urlString: string) => {
  if (urlString.includes('http')) {
    return urlString;
  }
  return `https://${urlString}`;
};

export const toUrl1 = (urlString: string) => {
  return urlString;
};
