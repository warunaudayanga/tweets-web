export type EntityId = string & { readonly __brand: unique symbol };

export type AccessToken = string & { readonly __brand: unique symbol };

export type RefreshToken = string & { readonly __brand: unique symbol };
