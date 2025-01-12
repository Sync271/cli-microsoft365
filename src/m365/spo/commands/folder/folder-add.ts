import { Logger } from '../../../../cli';
import {
  CommandOption
} from '../../../../Command';
import GlobalOptions from '../../../../GlobalOptions';
import request from '../../../../request';
import { urlUtil, validation } from '../../../../utils';
import SpoCommand from '../../../base/SpoCommand';
import commands from '../../commands';
import { FolderProperties } from './FolderProperties';

interface CommandArgs {
  options: Options;
}

interface Options extends GlobalOptions {
  webUrl: string;
  parentFolderUrl: string;
  name: string;
}

class SpoFolderAddCommand extends SpoCommand {
  public get name(): string {
    return commands.FOLDER_ADD;
  }

  public get description(): string {
    return 'Creates a folder within a parent folder';
  }

  public commandAction(logger: Logger, args: CommandArgs, cb: () => void): void {
    if (this.verbose) {
      logger.logToStderr(`Adding folder to site ${args.options.webUrl}...`);
    }

    const parentFolderServerRelativeUrl: string = urlUtil.getServerRelativePath(args.options.webUrl, args.options.parentFolderUrl);
    const serverRelativeUrl: string = `${parentFolderServerRelativeUrl}/${args.options.name}`;
    const requestUrl: string = `${args.options.webUrl}/_api/web/folders`;
    const requestOptions: any = {
      url: requestUrl,
      headers: {
        'accept': 'application/json;odata=nometadata'
      },
      data: {
        'ServerRelativeUrl': serverRelativeUrl
      },
      responseType: 'json'
    };

    request
      .post<FolderProperties>(requestOptions)
      .then((folder: FolderProperties): void => {
        logger.log(folder);
        cb();
      }, (err: any): void => this.handleRejectedODataJsonPromise(err, logger, cb));
  }

  public options(): CommandOption[] {
    const options: CommandOption[] = [
      {
        option: '-u, --webUrl <webUrl>'
      },
      {
        option: '-p, --parentFolderUrl <parentFolderUrl>'
      },
      {
        option: '-n, --name <name>'
      }
    ];

    const parentOptions: CommandOption[] = super.options();
    return options.concat(parentOptions);
  }

  public validate(args: CommandArgs): boolean | string {
    return validation.isValidSharePointUrl(args.options.webUrl);
  }
}

module.exports = new SpoFolderAddCommand();