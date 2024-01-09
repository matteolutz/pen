import PenLogger from '../../../util/logger';
import PenPerson from '../person';

abstract class PenTransform<
  I extends keyof PenPerson,
  O extends keyof PenPerson,
  A extends Partial<PenPerson> = {}
> {
  protected readonly _logger: PenLogger;

  protected constructor(public readonly name: string) {
    this._logger = PenLogger.instance.sub(name);
  }

  protected abstract _transform(
    input: Pick<PenPerson, I> & A
  ): Promise<Array<Pick<PenPerson, I | O> & A>>;

  public transform(
    input: Pick<PenPerson, I> & A
  ): Promise<Array<Pick<PenPerson, I | O> & A>> {
    return this._transform(input);
  }
}

export default PenTransform;
