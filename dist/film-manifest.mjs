// Only visually reviewed, accepted animation passages are enabled here.
const passage=(number,family)=>({standard:`assets/pass-0${number}-${family}-2k.mp4`,high:`assets/pass-0${number}-${family}-4k.mp4`});
export const films={
  landscape:[1,2,3].map(number=>passage(number,'landscape')),
  portrait:[1,2,3].map(number=>passage(number,'portrait')),
};
