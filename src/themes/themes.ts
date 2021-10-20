/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

export interface EUI_THEME {
  text: string;
  value: string;
}

export const EUI_THEMES: EUI_THEME[] = [
  {
    text: 'Tensei: Light',
    value: 'tensei-light',
  },
  {
    text: 'Tensei: Dark',
    value: 'tensei-dark',
  },
];
