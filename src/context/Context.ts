import { RequestLogger } from '../logger/RequestLogger';
import { TranslationDictionary } from '../translation/TranslationDictionary';

export interface Context {
  translationDictionary: TranslationDictionary;
  requestLogger: RequestLogger;
}
