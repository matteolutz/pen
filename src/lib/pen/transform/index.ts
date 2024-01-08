import PenPerson from "../person";

abstract class PenTransform<I extends keyof PenPerson, O extends keyof PenPerson> {

  public abstract transform(input: Pick<PenPerson, I>): Array<Pick<PenPerson, I | O>> | Promise<Array<Pick<PenPerson, I | O>>>;

}

export default PenTransform;