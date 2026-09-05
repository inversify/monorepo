``` ts
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
```
