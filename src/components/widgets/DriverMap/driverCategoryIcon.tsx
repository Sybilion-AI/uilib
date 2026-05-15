'use client';

import {
  ChartBarIcon,
  ChartLineIcon,
  CurrencyDollarIcon,
  DatabaseIcon,
  FactoryIcon,
  FlaskIcon,
  ForkKnifeIcon,
  GlobeIcon,
  HardHatIcon,
  HeartIcon,
  HouseIcon,
  IdentificationCardIcon,
  LightningIcon,
  ShoppingCartIcon,
  TShirtIcon,
  ThermometerIcon,
  TreeIcon,
  TruckIcon,
  UsersIcon,
  WalletIcon,
  WrenchIcon,
} from '@phosphor-icons/react';

// Icon mapping based on category
export const getCategoryIcon = (category: string | undefined | null) => {
  if (!category) {
    return <ChartBarIcon className="h-full w-full" />;
  }
  const categoryLower = category.toLowerCase();

  // Housing & Real Estate
  if (
    categoryLower.includes('housing') ||
    categoryLower.includes('real estate') ||
    categoryLower.includes('residential') ||
    categoryLower.includes('property')
  )
    return <HouseIcon className="h-full w-full" />;

  // Construction & Infrastructure
  if (
    categoryLower.includes('construction') ||
    categoryLower.includes('infrastructure') ||
    categoryLower.includes('building') ||
    categoryLower.includes('development') ||
    categoryLower.includes('engineering') ||
    categoryLower.includes('contracting')
  )
    return <HardHatIcon className="h-full w-full" />;

  // Climate & Environment
  if (
    categoryLower.includes('climate') ||
    categoryLower.includes('weather') ||
    categoryLower.includes('environment') ||
    categoryLower.includes('temperature') ||
    categoryLower.includes('global warming') ||
    categoryLower.includes('pollution') ||
    categoryLower.includes('sustainability') ||
    categoryLower.includes('green')
  )
    return <ThermometerIcon className="h-full w-full" />;

  // Supply Chain & Trade
  if (
    categoryLower.includes('supply') ||
    categoryLower.includes('trade') ||
    categoryLower.includes('logistics') ||
    categoryLower.includes('transport')
  )
    return <TruckIcon className="h-full w-full" />;

  // Energy & Power
  if (
    categoryLower.includes('energy') ||
    categoryLower.includes('power') ||
    categoryLower.includes('electricity')
  )
    return <LightningIcon className="h-full w-full" />;

  // Labor Market & Employment
  if (
    categoryLower.includes('labour') ||
    categoryLower.includes('employment') ||
    categoryLower.includes('jobs') ||
    categoryLower.includes('hiring') ||
    categoryLower.includes('unemployment') ||
    categoryLower.includes('wages') ||
    categoryLower.includes('salary') ||
    categoryLower.includes('job market') ||
    categoryLower.includes('workforce')
  )
    return <IdentificationCardIcon className="h-full w-full" />;

  // Workforce & Human Resources
  if (
    categoryLower.includes('workforce') ||
    categoryLower.includes('hr') ||
    categoryLower.includes('human resources') ||
    categoryLower.includes('personnel') ||
    categoryLower.includes('staffing') ||
    categoryLower.includes('talent') ||
    categoryLower.includes('recruitment')
  )
    return <UsersIcon className="h-full w-full" />;

  // Manufacturing & Production
  if (
    categoryLower.includes('volume') ||
    categoryLower.includes('production') ||
    categoryLower.includes('manufacturing') ||
    categoryLower.includes('industry')
  )
    return <FactoryIcon className="h-full w-full" />;

  // Finance & Economics
  if (
    categoryLower.includes('price') ||
    categoryLower.includes('inflation') ||
    categoryLower.includes('finance') ||
    categoryLower.includes('economy') ||
    categoryLower.includes('gdp')
  )
    return <CurrencyDollarIcon className="h-full w-full" />;

  // Data & Analytics
  if (
    categoryLower.includes('data') ||
    categoryLower.includes('analytics') ||
    categoryLower.includes('statistics')
  )
    return <DatabaseIcon className="h-full w-full" />;

  // Global & International
  if (
    categoryLower.includes('global') ||
    categoryLower.includes('international') ||
    categoryLower.includes('world')
  )
    return <GlobeIcon className="h-full w-full" />;

  // Chemicals & Pharmaceuticals
  if (
    categoryLower.includes('chemical') ||
    categoryLower.includes('pharmaceutical') ||
    categoryLower.includes('medicine') ||
    categoryLower.includes('drug') ||
    categoryLower.includes('compound')
  )
    return <FlaskIcon className="h-full w-full" />;

  // Food & Agriculture
  if (
    categoryLower.includes('food') ||
    categoryLower.includes('processed') ||
    categoryLower.includes('agriculture') ||
    categoryLower.includes('farming') ||
    categoryLower.includes('crop') ||
    categoryLower.includes('grain') ||
    categoryLower.includes('dairy') ||
    categoryLower.includes('meat')
  )
    return <ForkKnifeIcon className="h-full w-full" />;

  // Income & Wealth
  if (
    categoryLower.includes('income') ||
    categoryLower.includes('wealth') ||
    categoryLower.includes('salary') ||
    categoryLower.includes('wage') ||
    categoryLower.includes('earnings') ||
    categoryLower.includes('revenue')
  )
    return <WalletIcon className="h-full w-full" />;

  // Consumption & Retail
  if (
    categoryLower.includes('consumption') ||
    categoryLower.includes('retail') ||
    categoryLower.includes('shopping') ||
    categoryLower.includes('spending') ||
    categoryLower.includes('purchases') ||
    categoryLower.includes('demand')
  )
    return <ShoppingCartIcon className="h-full w-full" />;

  // Living Conditions & Quality of Life
  if (
    categoryLower.includes('living') ||
    categoryLower.includes('quality') ||
    categoryLower.includes('wellbeing') ||
    categoryLower.includes('health') ||
    categoryLower.includes('social') ||
    categoryLower.includes('welfare') ||
    categoryLower.includes('happiness')
  )
    return <HeartIcon className="h-full w-full" />;

  // Minerals & Mining
  if (
    categoryLower.includes('mineral') ||
    categoryLower.includes('mining') ||
    categoryLower.includes('ore') ||
    categoryLower.includes('metal') ||
    categoryLower.includes('coal') ||
    categoryLower.includes('gold') ||
    categoryLower.includes('copper') ||
    categoryLower.includes('iron') ||
    categoryLower.includes('aluminum') ||
    categoryLower.includes('lithium')
  )
    return <TreeIcon className="h-full w-full" />;

  // Textiles & Fibers
  if (
    categoryLower.includes('textile') ||
    categoryLower.includes('fiber') ||
    categoryLower.includes('fabric') ||
    categoryLower.includes('cloth') ||
    categoryLower.includes('cotton') ||
    categoryLower.includes('wool') ||
    categoryLower.includes('silk') ||
    categoryLower.includes('synthetic') ||
    categoryLower.includes('garment') ||
    categoryLower.includes('apparel')
  )
    return <TShirtIcon className="h-full w-full" />;

  // Crafts & Artisan
  if (
    categoryLower.includes('craft') ||
    categoryLower.includes('artisan') ||
    categoryLower.includes('handmade') ||
    categoryLower.includes('artistic') ||
    categoryLower.includes('creative') ||
    categoryLower.includes('design') ||
    categoryLower.includes('pottery') ||
    categoryLower.includes('woodwork') ||
    categoryLower.includes('jewelry')
  )
    return <WrenchIcon className="h-full w-full" />;

  // Population & Demographics
  if (
    categoryLower.includes('population') ||
    categoryLower.includes('demographic') ||
    categoryLower.includes('census') ||
    categoryLower.includes('birth') ||
    categoryLower.includes('death') ||
    categoryLower.includes('migration') ||
    categoryLower.includes('immigration') ||
    categoryLower.includes('age') ||
    categoryLower.includes('gender') ||
    categoryLower.includes('ethnicity')
  )
    return <UsersIcon className="h-full w-full" />;

  // Market Indices & Trading
  if (
    categoryLower.includes('market') ||
    categoryLower.includes('index') ||
    categoryLower.includes('indices') ||
    categoryLower.includes('trading') ||
    categoryLower.includes('stock') ||
    categoryLower.includes('equity') ||
    categoryLower.includes('s&p') ||
    categoryLower.includes('nasdaq') ||
    categoryLower.includes('dow') ||
    categoryLower.includes('ftse') ||
    categoryLower.includes('candlestick')
  )
    return <ChartLineIcon className="h-full w-full" />;

  // Default fallback
  return <ChartBarIcon className="h-full w-full" />;
};
