import { NominationReverseGeocodeSearchResult } from './utils/geocode';

export type PenCoordinates = {
  lat: string;
  lon: string;
};

export type PenAddress = PenCoordinates & {
  reverseLookup: NominationReverseGeocodeSearchResult;
};

type PenPerson = {
  name: string;
  surname: string;
  age: number;
  socialMediaHandle: string;
  email: string;
  phone: string;
  articles: Array<string>;
  pictures: Array<string>;
  homeAddress: PenAddress;
};

export default PenPerson;

export const comparePersonKey = (
  person1: Partial<PenPerson>,
  person2: Partial<PenPerson>,
  key: keyof PenPerson
): boolean => {
  if (!person1[key] || !person2[key]) {
    return false;
  }

  if (key === 'homeAddress') {
    return (
      person1[key]?.lat === person2[key]?.lat &&
      person1[key]?.lon === person2[key]?.lon
    );
  }

  return person1[key] === person2[key];
};

export const findPerson = (
  persons: Array<Partial<PenPerson>>,
  personToFind: Partial<PenPerson>
): number => {
  const significantKeys = [
    'name',
    'surname',
    'age',
    'socialMediaHandle',
    'email',
    'phone',
    'homeAddress'
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
): Partial<PenPerson> => ({
  ...person1,
  ...person2,
  articles: [
    ...new Set([...(person1.articles ?? []), ...(person2.articles ?? [])])
  ],
  pictures: [
    ...new Set([...(person1.pictures ?? []), ...(person2.pictures ?? [])])
  ]
});

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
