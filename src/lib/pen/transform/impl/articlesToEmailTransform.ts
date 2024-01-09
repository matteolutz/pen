import axios from 'axios';

import PenPerson from '../../person';
import PenTransform from '../index';

export type PenArticlesToEmailTransformInputKeys =
  | 'articles'
  | 'name'
  | 'surname'
  | 'homeAddress';

class PenArticlesToEmailTransform<
  A extends Partial<PenPerson>
> extends PenTransform<PenArticlesToEmailTransformInputKeys, 'email', A> {
  public constructor() {
    super('ArticlesToEmailTransform');
  }

  private _filterEmail(
    input: Pick<PenPerson, PenArticlesToEmailTransformInputKeys> & A,
    email: string
  ): boolean {
    // check how probable it is that the email is the author's email
    // if the email contains the author's name or surname, it's probably the author's email

    const name = input.name.toLowerCase();
    const surname = input.surname.toLowerCase();
    const emailLower = email.toLowerCase();

    const [emailName, emailDomain] = emailLower.split('@');
    const emailDomainParts = emailDomain.split('.');
    const emailTopLevelDomain = emailDomainParts[emailDomainParts.length - 1];

    let probability = 0;

    // todo: this isn't the right way
    if (
      emailTopLevelDomain ===
      input.homeAddress.reverseLookup.address.country_code
    ) {
      probability += 0.25;
    }

    if (emailName.includes(name)) {
      probability += 0.25;
    }

    if (emailName.includes(surname)) {
      probability += 0.5;
    }

    const r = new RegExp(
      `(${name.substring(0, 1)}\.${surname})|(${name}\.?${surname})`
    );
    if (r.test(emailName)) {
      probability += 0.5;
    }

    return probability >= 0.5;
  }

  protected async _transform(
    input: Pick<PenPerson, PenArticlesToEmailTransformInputKeys> & A
  ): Promise<
    Array<Pick<PenPerson, PenArticlesToEmailTransformInputKeys | 'email'> & A>
  > {
    // scrape every article and find an email address
    return (
      await Promise.all(
        input.articles.map(async (a) => {
          let response;
          try {
            response = await axios.get(a);
          } catch {
            return [];
          }

          this._logger.info(
            `Scraping article: ${a} - Encoding: ${response.headers['Content-Encoding']}`
          );

          if (
            !('Content-Encoding' in response.headers) ||
            response.headers['Content-Encoding']?.toString().startsWith('text/')
          ) {
            this._logger.info(`Found article with text/* encoding: ${a}`);

            const emailRegex =
              /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g;
            const emails = response.data.match(emailRegex);
            if (emails) {
              return emails
                .filter(this._filterEmail.bind(this, input))
                .map((e: string) => ({
                  ...input,
                  email: e
                }));
            }
          }

          return [];
        })
      )
    ).flatMap((el) => el) as Array<
      Pick<PenPerson, PenArticlesToEmailTransformInputKeys | 'email'> & A
    >;
  }
}

export default PenArticlesToEmailTransform;
