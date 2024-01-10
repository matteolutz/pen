import {
  NominationReverseGeocodeSearchResult
} from "./utils/geocode";

export type PenCoordinates = {
  lat: string;
  lon: string;
};

export enum PenAddressPrecisionLevel {
  COUNTRY = 0,
  CITY = 1,
  STREET = 2,
  HOUSE = 3
}

const PenAddressPrecisionLevelDisplay: Record<PenAddressPrecisionLevel, string> = {
  [PenAddressPrecisionLevel.COUNTRY]: "Country",
  [PenAddressPrecisionLevel.CITY]: "City",
  [PenAddressPrecisionLevel.STREET]: "Street",
  [PenAddressPrecisionLevel.HOUSE]: "House"
};

export type PenAddress = PenCoordinates & {
  reverseLookup: NominationReverseGeocodeSearchResult;
  precisionLevel: PenAddressPrecisionLevel;
};

type PenPerson = {
  name: string;
  surname: string;
  age: number;
  socialMediaHandle: string;
  email: Array<string>;
  phone: Array<string>;
  articles: Array<string>;
  images: Array<string>;
  homeAddress: PenAddress;
};

export default PenPerson;

export const prettyPrintPerson = (person: Partial<PenPerson>): string => {
  const address = person.homeAddress
    ? `${person.homeAddress.reverseLookup.display_name} (${PenAddressPrecisionLevelDisplay[person.homeAddress.precisionLevel]})`
    : "N/A";

  return `Name: ${person.name} ${person.surname}\nAge: ${person.age}\nSocial Media: ${person.socialMediaHandle}\nEmail: ${person.email?.join(
    ", "
  )}\nPhone: ${person.phone?.join(", ")}\nAddress: ${address}\n\nArticles: ${person.articles?.join(
    ", "
  )}\n\nPictures: ${person.images?.join(", ")}`;
};

export const comparePersonKey = (
  person1: Partial<PenPerson>,
  person2: Partial<PenPerson>,
  key: keyof PenPerson
): boolean => {
  if (!person1[key] || !person2[key]) {
    return false;
  }

  if (key === "homeAddress") {
    return (
      person1[key]?.lat === person2[key]?.lat &&
      person1[key]?.lon === person2[key]?.lon
    ) || person1[key]!.precisionLevel !== person2[key]!.precisionLevel;
  }

  return person1[key] === person2[key];
};

export const findPerson = (
  persons: Array<Partial<PenPerson>>,
  personToFind: Partial<PenPerson>
): number => {
  const significantKeys = [
    "name",
    "surname",
    "age",
    "socialMediaHandle",
    "homeAddress"
  ];

  for (const [idx, person] of persons.entries()) {
    const notMatching = Object.keys(personToFind).filter(
      (key) =>
        personToFind[key] &&
        person[key] &&
        !comparePersonKey(person, personToFind, key)
    );
    if (notMatching.some((key) => significantKeys.includes(key))) {
      continue;
    }

    return idx;
  }

  return -1;
};

export const mergePerson = (
  person1: Partial<PenPerson>,
  person2: Partial<PenPerson>
): Partial<PenPerson> => {

  let homeAddress;
  if (person1['homeAddress'] && person2['homeAddress']) {
    if (person1['homeAddress'].precisionLevel > person2['homeAddress'].precisionLevel) {
      homeAddress = person1['homeAddress'];
    } else {
      homeAddress = person2['homeAddress'];
    }
  }

  return {
    ...person1,
    ...person2,
    homeAddress,
    email: [
      ...new Set([...(person1.email ?? []), ...(person2.email ?? [])])
    ],
    phone: [
      ...new Set([...(person1.phone ?? []), ...(person2.phone ?? [])])
    ],
    articles: [
      ...new Set([...(person1.articles ?? []), ...(person2.articles ?? [])])
    ],
    images: [
      ...new Set([...(person1.images ?? []), ...(person2.images ?? [])])
    ]
  };
};


export const mergePersons = (
  persons: Array<Partial<PenPerson>>
): Array<Partial<PenPerson>> => {
  // try to merge the persons as much as possible
  // things, such as the socialMediaHandle or the homeAddress should be distinct
  // the articles and pictures should be merged

  const distinctPersons: Array<Partial<PenPerson>> = [];

  for (const person of persons) {
    const idx = findPerson(distinctPersons, person);
    if (idx === -1) {
      distinctPersons.push(person as PenPerson);
      continue;
    }

    distinctPersons[idx] = mergePerson(distinctPersons[idx], person);
  }

  return distinctPersons;
};
