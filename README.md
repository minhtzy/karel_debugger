# Karel Debugger for VS Code

A Visual Studio Code extension for debugging Karel and TP programs used in FANUC Robotics controllers. This extension provides comprehensive debugging capabilities and build tools for both Karel (.kl, .klh, .klt) and TP (.ls) programs.

## Features

- **Build Support**
  - Compile Karel programs using KTRANS compiler
  - Build TP programs using MAKETP
  - Automatic output directory management
  - Support for custom compiler paths and versions

- **Debug Capabilities**
  - Set and manage breakpoints
  - Step through code execution
  - Variable inspection
  - Pause and resume execution
  - Multi-file project support

- **FTP Integration**
  - Direct upload to robot controller
  - Secure credential management
  - Automatic file transfer after successful compilation

## Requirements

- Visual Studio Code 1.60.0 or newer
- KTRANS compiler (for Karel programs)
- MAKETP compiler (for TP programs)
- FTP access to robot controller (optional)

## Installation

1. Install the extension from VS Code Marketplace
2. Configure compiler paths in settings
3. Set up FTP credentials (optional)

## Configuration

Create or update your `.vscode/launch.json`:

```json
{
"version": "0.2.0",
    "configurations": [
        {
        "type": "karel",
        "request": "launch",
        "name": "Debug Karel Program",
        "program": "${file}",
        "ktransPath": "C:\\path\\to\\ktrans.exe",
        "maketpPath": "C:\\path\\to\\maketp.exe",
        "version": "2.3",
        "inifile": "${workspaceFolder}/config.ini",
        "sourceDirectory": "${workspaceFolder}/src",
        "ftpConfig": {
        "host": "192.168.1.100",
        "port": 21
        }
        }
    ]
}
```

### Configuration Options

- `program`: Path to the Karel source file
- `ktransPath`: Path to KTRANS compiler (default: "ktrans")
- `version`: Karel version (default: "2.3")
- `inifile`: Path to INI configuration file (optional)
- `sourceDirectory`: Directory containing Karel source files
- `ftpConfig`: FTP configuration for uploading to robot (optional)
  - `host`: Robot IP address
  - `port`: FTP port (default: 21)

## Usage

1. **Building Programs**
   - Open a Karel (.kl) or TP (.ls) file
   - Use Command Palette (`Ctrl+Shift+P`) and select "Karel: Build Program"
   - Or press F5 to build and start debugging

2. **Debugging**
   - Set breakpoints by clicking the gutter
   - Use debug toolbar for step, continue, and pause
   - View variables in the Debug sidebar

3. **FTP Upload**
   - Configure FTP settings in launch.json
   - Compiled files automatically upload after successful build
   - Use environment variables for secure credential storage

# Environment Variables

For FTP configuration, create a `.env` file in your workspace:
```
KAREL_FTP_USER=your_username
KAREL_FTP_PASSWORD=your_password
```


## Building from Source

Install dependencies
```bash
pnpm install
```
Compile
```bash
pnpm run compile
```
Package
```bash
pnpm run package
```
Run tests
```bash
pnpm test
```

## Extension Settings

This extension contributes the following settings:

* `karel.ktransPath`: Path to KTRANS compiler
* `karel.maketpPath`: Path to MAKETP compiler
* `karel.defaultVersion`: Default Karel version
* `karel.outputDirectory`: Custom output directory location

## Known Issues

- FTP upload requires manual credential management
- Limited support for older Karel versions
- MAKETP path must be set separately from KTRANS

## Release Notes

### 1.0.0
- Initial release
- Support for Karel and TP program debugging
- FTP integration
- Build system integration

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- FANUC Robotics for Karel programming language
- VS Code team for the debug adapter protocol
- Community contributors

## Support

For bug reports and feature requests, please use the [GitHub issues](https://github.com/yourusername/karel-debugger/issues) page.
