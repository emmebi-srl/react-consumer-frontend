import BigNumber from 'bignumber.js';
import { Money } from '~/types/money';
import { isDefined } from '~/types/typeGuards';

const moneyFormatters: Record<string, Intl.NumberFormat | undefined> = {};

export function formatMoney(money: Money): string {
  if (!moneyFormatters[money.currency]) {
    moneyFormatters[money.currency] = new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: money.currency,
    });
  }
  const formatter = moneyFormatters[money.currency] as Intl.NumberFormat;
  const amount = BigNumber(money.amount);
  return formatter.format(amount.toNumber());
}

export const formatMoneyWithSign = (money: Money) => {
  const formatter = new Intl.NumberFormat('it-IT', {
    currency: money.currency,
    signDisplay: 'exceptZero',
    style: 'currency',
  });

  const amount = BigNumber(money.amount);
  return formatter.format(amount.toNumber());
};

export const formatSign = (currency: Money['currency']) => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  })
    .formatToParts(1)
    .find((x) => x.type === 'currency')?.value;
};

export const formatMoneyNoDecimals = (money: Money) => {
  const formatter = new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: money.currency,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });

  const amount = BigNumber(money.amount);
  return formatter.format(amount.toNumber());
};

export const formatMoneyShort = (money: Money): string => {
  const currency = money.currency;
  const amount = BigNumber(money.amount).toNumber();
  const absoluteValue = Math.abs(amount);
  if (absoluteValue < 10_000_000) {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(amount);
  }

  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency,
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
    notation: 'compact',
    compactDisplay: 'short',
  })
    .format(amount)
    .replace('Mio\xA0', 'M');
};

export function sumMoney(leftMoney: Money, rightMoney: Money): Money {
  if (leftMoney.currency !== rightMoney.currency) {
    throw new TypeError('Operands have different curencies');
  }

  const leftAmount = BigNumber(leftMoney.amount);
  const rightAmount = BigNumber(rightMoney.amount);
  const resultAmount = leftAmount.plus(rightAmount);

  return {
    currency: leftMoney.currency,
    amount: resultAmount.toString(),
  };
}

export function maybeSumMoney(leftMoney: Money | null, rightMoney: Money | null): Money | null {
  if (!isDefined(leftMoney)) return rightMoney;
  if (!isDefined(rightMoney)) return leftMoney;

  return sumMoney(leftMoney, rightMoney);
}

export function subtractMoney(leftMoney: Money, rightMoney: Money): Money {
  if (leftMoney.currency !== rightMoney.currency) {
    throw new TypeError('Operands have different currencies');
  }

  const leftAmount = BigNumber(leftMoney.amount);
  const rightAmount = BigNumber(rightMoney.amount);
  const resultAmount = leftAmount.minus(rightAmount);

  return {
    currency: leftMoney.currency,
    amount: resultAmount.toString(),
  };
}

export function maybeSubtractMoney(leftMoney: Money | null, rightMoney: Money | null): Money | null {
  if (!isDefined(rightMoney)) return leftMoney;
  if (!isDefined(leftMoney)) return negateMoney(rightMoney);

  return subtractMoney(leftMoney, rightMoney);
}

export function negateMoney(money: Money): Money {
  return {
    currency: money.currency,
    amount: BigNumber(money.amount).negated().toString(),
  };
}

export function maybeNegateMoney(money: Money | null): Money | null {
  if (!isDefined(money)) return null;

  return negateMoney(money);
}

export function absMoney(money: Money): Money {
  return {
    currency: money.currency,
    amount: BigNumber(money.amount).abs().toString(),
  };
}

export function maybeAbsMoney(money: Money | null): Money | null {
  if (!isDefined(money)) return null;

  return absMoney(money);
}

export function isNotZero(money: Money | null): boolean {
  if (!isDefined(money)) {
    return false;
  }

  return !BigNumber(money.amount).isZero();
}

export function isZero(money: Money | null): boolean {
  if (!isDefined(money)) {
    return false;
  }

  return BigNumber(money.amount).isZero();
}

export function isMoreThanZero(money: Money): boolean {
  return BigNumber(money.amount).gt(0);
}

export function isLessThanZero(money: Money): boolean {
  return BigNumber(money.amount).lt(0);
}

export function maxMoney(...args: Money[]): Money | undefined {
  if (args.length === 0 || !args[0]) return undefined;
  const currency = args[0].currency;

  const arr = args.map((money) => {
    if (money.currency !== currency) {
      throw new TypeError('Operands have different curencies');
    }

    return BigNumber(money.amount);
  });

  const maxValue = BigNumber.max.apply(null, arr);
  return {
    amount: maxValue.toString(),
    currency,
  };
}

export function minMoney(...args: Money[]): Money | undefined {
  if (!args[0]) return undefined;
  const currency = args[0].currency;

  const arr = args.map((money) => {
    if (money.currency !== currency) {
      throw new TypeError('Operands have different curencies');
    }

    return BigNumber(money.amount);
  });

  const maxValue = BigNumber.min.apply(null, arr);
  return {
    amount: maxValue.toString(),
    currency,
  };
}

export function isMoneyGreaterThan(moneyA: Money, moneyB: Money) {
  if (moneyA.currency !== moneyB.currency) {
    throw new TypeError('Operands have different curencies');
  }
  return BigNumber(moneyA.amount).isGreaterThan(moneyB.amount);
}

export function isMoneyLessThan(moneyA: Money, moneyB: Money) {
  if (moneyA.currency !== moneyB.currency) {
    throw new TypeError('Operands have different curencies');
  }
  return BigNumber(moneyA.amount).isLessThan(moneyB.amount);
}

export function newMoney(amount: string | number, currency: Money['currency'] = 'EUR'): Money {
  return {
    amount: BigNumber(amount).toString(),
    currency,
  };
}

export function cloneMoney(money: Money): Money {
  return {
    currency: money.currency,
    amount: money.amount,
  };
}

export function getNumberAmount(money: Money): number {
  return BigNumber(money.amount).toNumber();
}

export function maybeGetNumberAmount(money: Money | null): number | null {
  if (!isDefined(money)) return null;
  return getNumberAmount(money);
}
