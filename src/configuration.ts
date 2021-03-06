import { ChangelogConfiguration, PackageJsonFile } from './interfaces';
import fs from 'fs';
import merge from './helpers/merge';
import { PackageJSONLoader } from './package';

/**
 * Default configuration
 */
export const CONFIG: ChangelogConfiguration = {
  default_type: 'other',
  types: {
    breaking: 'Breaking Changes',
    build: 'Build System / Dependencies',
    ci: 'Continuous Integration',
    chore: 'Chores',
    docs: 'Documentation Changes',
    feat: 'New Features',
    fix: 'Bug Fixes',
    other: 'Other Changes',
    perf: 'Performance Improvements',
    refactor: 'Refactors',
    revert: 'Reverts',
    style: 'Code Style Changes',
    test: 'Tests'
  },
  dateFormat: 'mmmm d, yyyy',
  outputMarkdown: 'CHANGELOG.md',
  outputJSON: 'changelog.json',
  format: 'markdown',
  range: undefined,
  exclude: '',
  output: undefined,
  repoUrl: '',
  nobody: false,
  allowUnknown: false,
  target: undefined,
  // @deprecated
  version: undefined
};


/**
 * Get access to the configration
 *
 * If needed, fetch it from changelogrc.json, package.json or create it on the fly
 */
export class Configuration {
  constructor(config: ChangelogConfiguration = {} as ChangelogConfiguration) {
    let pkgjson;

    if (config) {
      this._config = merge(CONFIG, config)
    }

    // Get Package Version
    if (fs.existsSync(`${process.cwd()}/package.json`)) {
      pkgjson = (new PackageJSONLoader(`${process.cwd()}/package.json`)).getContent() as PackageJsonFile;
      this._config = merge(this.config, { target: pkgjson?.version })
    }

    // Load default
    // Check for changelogrc.json
    if (fs.existsSync(`${process.cwd()}/changelogrc.json`)) {
      this._config = merge(
        this.config,
        (new PackageJSONLoader(`${process.cwd()}/changelogrc.json`)).getContent()
      )
      return;
    }

    if (pkgjson) {
      if (pkgjson && pkgjson.changelog) {
        this._config = merge(
          this.config,
          pkgjson.changelog
        );
      }
    }
  }

  /**
   * Load external content and replace the _config
   * @param path path to file
   */
  loadFromPath(path: string) {
    const loader = new PackageJSONLoader(path);
    const content = loader.getContent();
    this._config = merge(CONFIG, content)
  }

  /**
   * Get config
   */
  private _config?: ChangelogConfiguration;
  get config() {
    return this._config || CONFIG;
  }

  /**
   * Get version
   */
  get version() {
    return this._config?.version || this._config?.target || ''
  }

  /**
   * Get repository
   */
  get repository() {
    return this._config?.repoUrl || ''
  }

}