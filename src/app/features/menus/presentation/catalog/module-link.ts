import { IconName } from '../../../../shared/ui/icon/icon-name';
import { Tone } from '../../../../shared/ui/tone/tone';
import { FeatureFlag } from '../../../../core/config/feature-flag';

export interface ModuleLink {
  label: string;
  path: string;
  /** Ícono del menú lateral. */
  icon: IconName;
  /** Ícono y color de la tarjeta en Inicio. */
  cardIcon: IconName;
  cardTone: Tone;
  description: string;
  /** Funcionalidad que habilita el módulo; apagada, el menú lo marca «Pronto». */
  feature: FeatureFlag;
}
