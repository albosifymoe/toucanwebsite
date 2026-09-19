// Every browser video ships with the site; no generation-service URLs are needed.
const passage=(number,family)=>{
  // Preserve the approved editorial repair for the second portrait passage.
  const stem=number===2&&family==='portrait'
    ?'pass-02-portrait-repaired'
    :`pass-0${number}-${family}`;
  return {standard:`assets/${stem}-2k.mp4`,high:`assets/${stem}-4k.mp4`};
};
export const films={landscape:[1,2,3].map(n=>passage(n,'landscape')),portrait:[1,2,3].map(n=>passage(n,'portrait'))};
