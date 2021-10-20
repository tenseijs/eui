import lightColors from '!!sass-vars-to-js-loader!../../../../src/global_styling/variables/_colors.scss';
import darkColors from '!!sass-vars-to-js-loader!../../../../src/themes/eui/eui_colors_dark.scss';
import lightTenseiColors from '!!sass-vars-to-js-loader!../../../../src/themes/tensei/eui_tensei_colors_light.scss';
import darkTenseiColors from '!!sass-vars-to-js-loader!../../../../src/themes/tensei/eui_tensei_colors_dark.scss';
import { useContext } from 'react';
import { ThemeContext } from '../../components';

export const useSassVars = () => {
  const themeContext = useContext(ThemeContext);
  let palette;
  switch (themeContext.theme) {
    case 'tensei-dark':
      palette = { ...darkColors, ...darkTenseiColors };
      break;
    case 'tensei-light':
      palette = { ...lightColors, ...lightTenseiColors };
      break;
    case 'dark':
      palette = darkColors;
      break;
    default:
      palette = lightColors;
      break;
  }

  return palette;
};
