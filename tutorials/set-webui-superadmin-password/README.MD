# Setting the WebUI's superadmin password


## Introduction

The Nokia Beacon G6 (and likely other Beacon routers') firmware has a privileged WebUI account named
`superadmin`. The same user also exists as a Linux account on the router. On the firmware analyzed 
for this repository, they are not the same credential.

The WebUI authentication database contains a mutable password field for `superadmin`. The linux account, 
meanwhile, remains tied to a separate factory/preset password hash. Changing one does not automatically
change the other.

Initially, both the passwords are indeed the same. There lies no resolved generator path found in the 
router's files, so all evidence points to the fact that it was factory provisioned. Thus, you can't simply
read or re-generate the existing password; you must set it to something new.

This tutorial shows how to change only the **WebUI** `superadmin` password by replacing the hash
stored in the configuration database. It does not modify `/etc/shadow`, the factory preset credential, 
or the Linux `superadmin` password.

In the configuration database, the mutable WebUI password lives at:
```
InternetGatewayDevice.X_Authentication.WebAccount.Password
```

The factory provisioned hash lives at:
```
InternetGatewayDevice.X_Authentication.WebAccount.PresetPassword
```

We will be modifying only the former.


### What you will do:
1. Choose a new WebUI password
2. Generate a standard SHA-256-crypt hash for it
3. Write that hash to the WebUI password field with `cfgcli`
4. Reboot and log in to the WebUI with the new plaintext password.

### What you need:
1. An existing privileged UART/shell session on your router
2. The router's cfgcli utility (should be present by default)
3. A trusted computer with OpenSSL available to generate the hash




### 1. Confirm your `cfgcli` syntax

We will be using the command line tool cfgcli to set the password instead of manually modifying the storage.

Run: 
```shell
cfgcli -h
```

On this Nokia firmware family, the syntax is:
```shell
-s [path value]    set parameter value by path
-f                 force write; used with -s
-g [path]          get parameter value by path
```

Therefore, the command form is:
```shell
cfgcli -f -s URI VALUE
```

### 2. Hash your password

On the firmware analyzed, the password is passed in as a SHA-256-crypt value in the normal 
linux `$5$...` format. We cannot set a plaintext password directly.

Example shape:
```shell
$5$random_salt$hash_data
```

Generate the hash on a trusted computer with `openssl`:
```shell
openssl passwd -5
```

Copy the generated hash.

### 3. Setting the password 

On the router, execute:

```shell
cfgcli -f -s "InternetGatewayDevice.X_Authentication.WebAccount.Password" '$5$YOUR_SALT$YOUR_HASH'
```

Replace YOUR_SALT and YOUR_HASH with the relevant values obtained from the previous step.


### 4. Password Persistence

After writing the password, execute:
```shell
sync
```

This makes the change persistent. A reboot is the simplest way to make sure the authentication process
reloads the value. After the router turns back on, log into the WebUI with your superadmin credentials 
and confirm.

> [!caution]
> Keep your shell session open until you have tested the new login. 



--- 

### Why `cfgcli -g` may not show the hash

If you run:
```shell
cfgcli -g 'InternetGatewayDevice.X_Authentication.WebAccount.Password'
```

It will likely give you a masked value such as `******`

This is presentation-layer masking and does not mean the write failed. During the reverse-engineering work, 
the underlying raw value was confirmed through `libcfg.so`'s `cfg_GetParamValueByUri()` API.

--- 

### What _not_ to modify

- Do not write to `InternetGatewayDevice.X_Authentication.WebAccount.PresetPassword`
- Also, Don't modify the factory SECURITY field `EXT_WEB_MGNT_PWD`

On the firmware analyzed here, those values are part of the factory credential path and are also 
related to the Linux superadmin account.
