import PenPerson from '../../person';
import Transform from '../index';

class PenNameToSocialMediaHandleTransform<
  A extends Partial<PenPerson>
> extends Transform<'name' | 'surname', 'socialMediaHandle', A> {
  public constructor() {
    super('NameToSocialMediaHandleTransform');
  }

  private _removeVowels(input: string): string {
    return input.replace(/[aeiou]/gi, '');
  }

  protected async _transform(
    input: A & Pick<PenPerson, 'name' | 'surname'>
  ): Promise<
    Array<A & Pick<PenPerson, 'name' | 'surname' | 'socialMediaHandle'>>
  > {
    const handles = [
      `${input.name.toLowerCase()}${input.surname.toLowerCase()}`,
      `${input.name.toLowerCase()}.${input.surname.toLowerCase()}`,
      `${input.name.toLowerCase()}_${input.surname.toLowerCase()}`,
      `${input.name.toLowerCase()}-${input.surname.toLowerCase()}`,
      `${input.name
        .substring(0, 1)
        .toLowerCase()}${input.surname.toLowerCase()}`,
      `${input.name
        .substring(0, 1)
        .toLowerCase()}.${input.surname.toLowerCase()}`,
      `${input.name
        .substring(0, 1)
        .toLowerCase()}_${input.surname.toLowerCase()}`,
      `${input.name
        .substring(0, 1)
        .toLowerCase()}-${input.surname.toLowerCase()}`,
      `${input.name.toLowerCase()}${this._removeVowels(
        input.surname.toLocaleLowerCase()
      )}`,
      `${input.name.toLowerCase()}.${this._removeVowels(
        input.surname.toLocaleLowerCase()
      )}`,
      `${input.name.toLowerCase()}_${this._removeVowels(
        input.surname.toLocaleLowerCase()
      )}`,
      `${input.name.toLowerCase()}-${this._removeVowels(
        input.surname.toLocaleLowerCase()
      )}`
    ];

    return handles.map((h) => ({
      ...input,
      socialMediaHandle: h
    }));
  }
}

export default PenNameToSocialMediaHandleTransform;
