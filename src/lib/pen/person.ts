export type PenCoordinates = {
  lat: number;
  lon: number;
}

type PenPerson = {
  name: string;
  surname: string;
  age: number;
  socialMediaHandle: string;
  articles: Array<string>;
  pictures: Array<string>;
  homeAddress: PenCoordinates;
}

export default PenPerson;