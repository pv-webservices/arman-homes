// Real handover moments supplied by Arman Homes. Derivatives are built by scripts/prepare-happy-clients.mjs.
export type HappyClient = { n: number; label: string; caption: string; alt: string };

export const happyClients: HappyClient[] = [
  { n: 1, label: 'Key Handover', caption: 'Keys to a new home, handed over at our office.', alt: 'Arman Homes team member handing a set of keys to a smiling client in the office' },
  { n: 3, label: 'Move-In Day', caption: 'Keys handed over inside the client’s new home.', alt: 'Two couples smiling as keys are handed over in an empty, freshly finished apartment' },
  { n: 2, label: 'Deal Closed', caption: 'Celebrating a successful closing together.', alt: 'A group of five smiling clients and team members celebrating a handover at the Arman Homes office' },
  { n: 5, label: 'Agreement Signed', caption: 'Documents handed over after a smooth agreement.', alt: 'A client receiving a document folder from the Arman Homes team at the office desk' },
  { n: 6, label: 'Paperwork Complete', caption: 'Final paperwork handed over to our client.', alt: 'Three men outside a bank branch in Kalewadi, one handing a document folder to another' },
  { n: 4, label: 'Happy Clients', caption: 'Another milestone completed with our clients.', alt: 'Three men standing together and smiling outside a bank branch' },
];

export const happyClientImage = (n: number, small = false) => `/images/happy-clients/happy-client-${n}${small ? '-small' : ''}.webp`;
