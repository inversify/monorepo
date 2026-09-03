``` ts
const bindingIdentifier: BindingIdentifier = container
    .bind('MyService')
    .to(MyServiceImpl)
    .getIdentifier();

  // Later, unbind just this specific binding
  await container.unbind(bindingIdentifier);
```
