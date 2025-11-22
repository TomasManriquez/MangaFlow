// Scraper Factory
// Returns the appropriate scraper instance based on source

import { IScraper } from './base/Scraper.interface.js';
import { MangaDexScraper } from './mangadex/MangaDexScraper.js';
import { ZonaTmoScraper } from './zonatmo/ZonaTmoScraper.js';
import { MangaPlusScraper } from './mangaplus/MangaPlusScraper.js';

type ScraperSource = 'mangadex' | 'zonatmo' | 'mangaplus';

class ScraperFactory {
    private static instances: Map<ScraperSource, IScraper> = new Map();

    static getScraper(source: ScraperSource): IScraper {
        // Use singleton pattern for scrapers
        if (!this.instances.has(source)) {
            switch (source) {
                case 'mangadex':
                    this.instances.set(source, new MangaDexScraper());
                    break;
                case 'zonatmo':
                    this.instances.set(source, new ZonaTmoScraper());
                    break;
                case 'mangaplus':
                    this.instances.set(source, new MangaPlusScraper());
                    break;
                default:
                    throw new Error(`Unknown scraper source: ${source}`);
            }
        }

        return this.instances.get(source)!;
    }

    static getAllScrapers(): IScraper[] {
        return [
            this.getScraper('mangadex'),
            this.getScraper('zonatmo'),
            this.getScraper('mangaplus')
        ];
    }
}

export default ScraperFactory;
