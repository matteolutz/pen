import PenLogger from '../../util/logger';
import PenPerson from './person';
import PenTransform from './transform';

class PenPipe {
  public constructor(private readonly _pipes: Array<PenTransform<any, any>>) {}

  public async transform(
    input: Partial<PenPerson>
  ): Promise<Array<Partial<PenPerson>>> {
    // each pipe transforms the input and returns a new array of persons
    // the array of persons should then be passed to the next pipe individually
    // we need to allow for infinite depth, so we need to use recursion

    const [first, ...rest] = this._pipes;

    if (!first) {
      return [input];
    }

    const transformed = await first.transform(input);

    const next = new PenPipe(rest);

    const nextTransformed = await Promise.all(
      transformed.map((t) => next.transform(t))
    );

    return nextTransformed.flat();
  }
}

export default PenPipe;

const PenPipeLogger = PenLogger.instance.sub('PenPipe');

export const pipe = async (
  input: Partial<PenPerson>,
  ...pipes: Array<PenTransform<any, any>>
): Promise<Array<Partial<PenPerson>>> => {
  const [first, ...rest] = pipes;

  if (!first) {
    return [input];
  }

  const transformed = await first.transform(input);
  PenPipeLogger.info(`${first.name} generated ${transformed.length} results`);

  const nextTransformed = await Promise.all(
    transformed.map(async (t) => await pipe(t, ...rest))
  );

  return [...transformed, ...nextTransformed.flat()];
};
