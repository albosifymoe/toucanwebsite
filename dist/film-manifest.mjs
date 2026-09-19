// Published previews stream completed videos from their existing media URLs.
// The local preview keeps using the preserved browser-delivery files.
const hosted=Boolean(globalThis.location&&!['127.0.0.1','localhost','::1'].includes(location.hostname));
const media={
  "landscape": [
    {
      "standard": "https://d2ol7oe51mr4n9.cloudfront.net/user_2yVZgkwULzueR5KQQZqeUMpAZHE/5f5e6418-6d93-4647-999d-48bce2d7cae8.mp4",
      "high": "https://d2ol7oe51mr4n9.cloudfront.net/user_2yVZgkwULzueR5KQQZqeUMpAZHE/d09bdd66-cc02-4694-b267-5232d22db274.mp4"
    },
    {
      "standard": "https://d2ol7oe51mr4n9.cloudfront.net/user_2yVZgkwULzueR5KQQZqeUMpAZHE/aa1f2ba4-5008-4d7c-a499-8425aedb5711.mp4",
      "high": "https://d2ol7oe51mr4n9.cloudfront.net/user_2yVZgkwULzueR5KQQZqeUMpAZHE/a2d5ef14-931c-44f5-888b-d3f3af466b72.mp4"
    },
    {
      "standard": "https://d2ol7oe51mr4n9.cloudfront.net/user_2yVZgkwULzueR5KQQZqeUMpAZHE/7794f1f1-85df-44b8-b4ae-a4381cfe2a20.mp4",
      "high": "https://d2ol7oe51mr4n9.cloudfront.net/user_2yVZgkwULzueR5KQQZqeUMpAZHE/473efacc-a535-42dd-ab28-fd816b459cf3.mp4"
    }
  ],
  "portrait": [
    {
      "standard": "https://d2ol7oe51mr4n9.cloudfront.net/user_2yVZgkwULzueR5KQQZqeUMpAZHE/bc483510-53d2-4ea2-80fd-d83de81957f2.mp4",
      "high": "https://d2ol7oe51mr4n9.cloudfront.net/user_2yVZgkwULzueR5KQQZqeUMpAZHE/e37af807-463d-4d61-8ecc-cf10ce0d314a.mp4"
    },
    {
      "standard": "https://d2ol7oe51mr4n9.cloudfront.net/user_2yVZgkwULzueR5KQQZqeUMpAZHE/038a98aa-cab1-49c7-9499-733b13ff67f7.mp4",
      "high": "https://d2ol7oe51mr4n9.cloudfront.net/user_2yVZgkwULzueR5KQQZqeUMpAZHE/a54f3e34-8b22-46dd-a8ea-52644aaa7af1.mp4"
    },
    {
      "standard": "https://d2ol7oe51mr4n9.cloudfront.net/user_2yVZgkwULzueR5KQQZqeUMpAZHE/fa78d3c9-5b5b-4966-881e-fac6ea5d21b5.mp4",
      "high": "https://d2ol7oe51mr4n9.cloudfront.net/user_2yVZgkwULzueR5KQQZqeUMpAZHE/56becf68-08a4-4c8c-8f37-f2bd30fdc24f.mp4"
    }
  ]
};
const passage=(number,family)=>{
  // Local editorial repair: extended leaf occlusion removes the generated
  // bare-rope/banner pop. Ship these files with every deployment.
  if(number===2&&family==='portrait')return {standard:'assets/pass-02-portrait-repaired-2k.mp4',high:'assets/pass-02-portrait-repaired-4k.mp4'};
  return hosted?media[family][number-1]:{standard:`assets/pass-0${number}-${family}-2k.mp4`,high:`assets/pass-0${number}-${family}-4k.mp4`};
};
export const films={landscape:[1,2,3].map(n=>passage(n,'landscape')),portrait:[1,2,3].map(n=>passage(n,'portrait'))};
