import PenLogger from "../../../util/logger";
import PenPerson, { findPerson, mergePerson } from "../person";

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

// merge the output of two transforms into one
export class MergeTransform<
  I extends keyof PenPerson,
  A extends Partial<PenPerson> = {}
> extends PenTransform<I, I, A> {

  public constructor(private readonly _constP: Pick<PenPerson, I> & A, private readonly transformB: PenTransform<I, any, A>) {
    super("MergeTransform");
  }

  protected async _transform(input: Pick<PenPerson, I> & A): Promise<Array<Pick<PenPerson, I> & A>> {
    let constP = { ...this._constP };
    const resultB = await this.transformB.transform(input);

    for (const p of resultB) {
      const idx = findPerson([constP], p);
      if (idx === -1) {
        continue;
      }

      constP = mergePerson(constP, p) as Pick<PenPerson, I> & A;
    }

    return [constP];
  }

}