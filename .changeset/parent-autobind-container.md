---
"@inversifyjs/container": minor
---

Added support for parent container autobind functionality to work with child containers that have autobind disabled. Container now passes autobind options to BindingService, enabling parent autobind to function even when child containers don't have autobind enabled.