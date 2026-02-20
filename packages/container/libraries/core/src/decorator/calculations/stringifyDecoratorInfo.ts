import { type DecoratorInfo } from '../models/DecoratorInfo.js';
import { DecoratorInfoKind } from '../models/DecoratorInfoKind.js';

export function stringifyDecoratorInfo(
  decoratorTargetInfo: DecoratorInfo,
): string {
  switch (decoratorTargetInfo.kind) {
    case DecoratorInfoKind.method:
      return `[class: "${decoratorTargetInfo.targetClass.name}", method: "${decoratorTargetInfo.method.toString()}"]`;
    case DecoratorInfoKind.parameter:
      return `[class: "${decoratorTargetInfo.targetClass.name}", index: "${decoratorTargetInfo.index.toString()}"]`;
    case DecoratorInfoKind.property:
      return `[class: "${decoratorTargetInfo.targetClass.name}", property: "${decoratorTargetInfo.property.toString()}"]`;
  }
}
