``` ts
const container: Container = new Container();

// The identifier can be used to unbind this specific binding later
export const bindingIdentifier: BindingIdentifier = container
  .bind('MyService')
  .to(MyServiceImpl)
  .getIdentifier();
```
