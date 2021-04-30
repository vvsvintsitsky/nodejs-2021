import { RequestLogger } from '../logger/RequestLogger';
import { TranslationDictionary } from '../translation/TranslationDictionary';
import { Logger } from '../logger/Logger';

export interface Context {
  translationDictionary: TranslationDictionary;
  logger: Logger;
  requestLogger: RequestLogger;
}
