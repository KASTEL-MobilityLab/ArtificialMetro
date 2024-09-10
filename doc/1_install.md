Install
=======

## Requirements
- node.js and npm
- bash
- a modern browser
- for automatic updates:
    * wget
    * unzip
    * zenity

## Install standalone
1. Download and extract the latest version as zip or with git
2. Move to target directory (we assume `~/metro`)
3. Open a shell in the directory
4. Make sure that the bash scripts have execution permission: `chmod u+x *.sh`
5. Run install script: `./update.sh install && ./update.sh postinstall`
6. Start the server with `npm run prod` and open the browser at `localhost:3000`

### Manual Install
*These are the manual install steps for step 5. You do not need to run them manually when you follow the steps above*

- `npm install`
- `npm run build`

## Install with automatic update
You need to install the additional requirements as outline in [Requirements](#requirements)

1. Use the zip version for this install method
2. Extract in target directory (we assume `~/metro`)
3. Copy files from `aux` to a directory outside of you install directory
    1. Make sure the `*.sh` files have execution permission.
    2. Set `INSTALL_DIR` in `auto-update.sh` and `start-metro.sh` to the install directory. Preferably use absolute paths.
    3. Replace `chromium-browser` in `start-metro.sh` with the browser of your choice.
    4. To start Metro Demonstrator automatically, you need to invoke `start-metro.sh`. Consult your system manual on how to do that.
4. Make sure that the bash scripts have execution permission: `chmod u+x *.sh`
5. Run install script: `./update.sh install && ./update.sh postinstall`
6. Start the server with `start-metro.sh`. This starts the server and opens the browser at `loclahost:3000`

## Manual update
*Only for zip installs. Use `git pull` for git installs*

1. Switch to the install directory
2. Download update with `./update.sh download`
3. (optional) Run production tests to make sure the new version will still operate on your system: `./update.sh test`. Results can be found in `update/prod-test-results.txt`
4. Apply the update with `./update.sh/apply`