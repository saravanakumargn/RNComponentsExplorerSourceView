// `react-navigation` expects to work with type instead of interface
/* eslint-disable @typescript-eslint/consistent-type-definitions */
// Host integration: the same route names as a value, so the navigator can
// validate a `?demo=` deep link and the flow generator can read them.
export const ROUTE_NAMES = [
  "Examples",
  "List",
  "SectionList",
  "Reminders",
  "PaginatedList",
  "Debug",
  "Contacts",
  "ContactsSectionList",
  "Masonry",
  "Grid",
  "DynamicColumnSpan",
  "HorizontalList",
  "Chat",
  "HeaderFooterExample",
  "DynamicItems",
  "RecyclerViewHandlerTest",
  "MovieList",
  "Carousel",
  "LayoutOptions",
  "ShowcaseApp",
] as const;

export type RootStackParamList = {
  Examples: undefined;
  List: undefined;
  SectionList: undefined;
  Reminders: undefined;
  PaginatedList: undefined;
  Debug: undefined;
  Contacts: undefined;
  ContactsSectionList: undefined;
  Masonry: undefined;
  Grid: undefined;
  DynamicColumnSpan: undefined;
  HorizontalList: undefined;
  Chat: undefined;
  HeaderFooterExample: undefined;
  DynamicItems: undefined;
  RecyclerViewHandlerTest: undefined;
  MovieList: undefined;
  Carousel: undefined;
  LayoutOptions: undefined;
  ShowcaseApp: undefined;
};
