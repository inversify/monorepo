``` ts
const bindingIdentifier: BindingIdentifier = container
    .bind('MyService')
    .to(MyServiceImpl)
    .getIdentifier();

  // Later, unbind just this specific binding
  container.unbind(bindingIdentifier);
```
