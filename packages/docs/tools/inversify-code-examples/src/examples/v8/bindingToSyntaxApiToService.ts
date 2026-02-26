// Is-inversify-import-example
import { Container } from 'inversify8';

interface CardCatalogProvider<TCard> {
  fetch(limit: number, offset: number): Promise<TCard[]>;
}

interface LorcanaCard {
  cost: number;
  name: string;
}

interface MtgCard {
  name: string;
  color: string;
}

export class LorcanaCardCatalogProvider implements CardCatalogProvider<LorcanaCard> {
  public async fetch(_limit: number, _offset: number): Promise<LorcanaCard[]> {
    return [];
  }
}

export class MtgCardCatalogProvider implements CardCatalogProvider<MtgCard> {
  public async fetch(_limit: number, _offset: number): Promise<MtgCard[]> {
    return [];
  }
}

export const cardCatalogProviderSymbol: symbol = Symbol.for(
  'CardCatalogProvider',
);

export const lorcanaCardCatalogProviderSymbol: symbol = Symbol.for(
  'LorcanaCardCatalogProvider',
);

export const mtgCardCatalogProviderSymbol: symbol = Symbol.for(
  'MtgCardCatalogProvider',
);

// Begin-example
const container: Container = new Container();

container.bind(lorcanaCardCatalogProviderSymbol).to(LorcanaCardCatalogProvider);
container.bind(mtgCardCatalogProviderSymbol).to(MtgCardCatalogProvider);

container
  .bind(cardCatalogProviderSymbol)
  .toService(lorcanaCardCatalogProviderSymbol);
container
  .bind(cardCatalogProviderSymbol)
  .toService(mtgCardCatalogProviderSymbol);

const cardCatalogProviders: CardCatalogProvider<unknown>[] = container.getAll(
  cardCatalogProviderSymbol,
);
// End-example

export { cardCatalogProviders };
