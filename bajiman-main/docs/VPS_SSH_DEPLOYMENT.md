# VPS SSH status access and deployment account

This guide configures a dedicated non-root SSH account for **read-only VPS status checks**. It does not grant general root access, Docker-group access, arbitrary shell commands through `sudo`, or permission to deploy/restart services. Those capabilities require a separate, narrowly scoped policy.

## 1. Create a dedicated SSH key on your workstation

Keep private keys outside the repository. For interactive use, generate a passphrase-protected Ed25519 key:

```bash
ssh-keygen -t ed25519 -a 100 \
  -f ~/.ssh/ipms-vps-status \
  -C "vps-status-readonly"
```

Use `ssh-agent` to unlock it when running checks. Share/install **only** the `.pub` file contents. Do not put the private key in GitHub, chat, a dotenv file, or the VPS account's `authorized_keys`.

## 2. Create the non-root account and install the public key

Use the VPS provider console or an already-authorized administrator session. Review each command for the distribution in use. The example account is `vps-deploy`; replace the placeholder with the public key generated above.

```bash
useradd --create-home --shell /bin/bash vps-deploy
install -d -o vps-deploy -g vps-deploy -m 0700 /home/vps-deploy/.ssh
printf '%s\n' 'ssh-ed25519 REPLACE_WITH_YOUR_PUBLIC_KEY_COMMENT' \
  > /home/vps-deploy/.ssh/authorized_keys
chown vps-deploy:vps-deploy /home/vps-deploy/.ssh/authorized_keys
chmod 0600 /home/vps-deploy/.ssh/authorized_keys
```

Do not enable root SSH login for this account. Keep provider-console or another administrator access available until the new account has been tested successfully.

## 3. Install the fixed, root-owned status helper

Copy [`ops/vps-status-readonly.sh`](../ops/vps-status-readonly.sh) to the VPS through an approved deployment path, then install it as root:

```bash
install -o root -g root -m 0755 \
  /path/to/repository/ops/vps-status-readonly.sh \
  /usr/local/sbin/vps-status-readonly
```

The helper lists running and failed systemd units, Docker containers, top process names (not arguments), and listening TCP sockets. It deliberately does not read `.env` files, process arguments, service environment variables, or unit-file contents.

## 4. Grant exactly one sudo command

Create `/etc/sudoers.d/vps-status-readonly` with this single rule:

```sudoers
vps-deploy ALL=(root) NOPASSWD: /usr/local/sbin/vps-status-readonly ""
```

The `""` argument specification means this exact command is allowed only with no arguments.

Set restrictive permissions and validate the syntax before use:

```bash
chown root:root /etc/sudoers.d/vps-status-readonly
chmod 0440 /etc/sudoers.d/vps-status-readonly
visudo -cf /etc/sudoers.d/vps-status-readonly
```

The status helper must remain owned by root and not writable by `vps-deploy`; otherwise the user might replace the helper and execute arbitrary commands as root. Do not add this account to the `docker` group: Docker access is effectively root-equivalent. Do not grant `NOPASSWD: ALL`, a wildcard command, or unrestricted `systemctl`/`docker` access.

## 5. Verify and run from the repository

First verify normal SSH login and sudo scope:

```bash
ssh -i ~/.ssh/ipms-vps-status -o IdentitiesOnly=yes vps-deploy@128.140.100.85 \
  'sudo -n /usr/local/sbin/vps-status-readonly'
```

Before the first connection, verify the VPS SSH host-key fingerprint through the provider console or another trusted channel, then add the verified host key to your local `known_hosts`. Do not trust an unverified `ssh-keyscan` result. The wrapper requires `StrictHostKeyChecking=yes`. Run it with:

```bash
SSH_IDENTITY_FILE="$HOME/.ssh/ipms-vps-status" \
  ./ops/check-vps-status.sh 128.140.100.85 vps-deploy
```

The wrapper requires `StrictHostKeyChecking=yes`, disables password and keyboard-interactive authentication, and invokes only the fixed helper. If you use an SSH agent instead of `SSH_IDENTITY_FILE`, ensure the expected key is loaded. To remove access later, remove the account's public key from `authorized_keys`; deleting the local private key alone does not revoke the server-side authorization.

## 6. If actual deployments are needed

This setup intentionally allows status reporting only. For deployments, prefer a CI/CD identity that can update application files without root, with narrowly scoped service restart commands only if needed. Define and review the exact file paths and service names before adding a separate sudoers rule. Never reuse a public key or secret that was previously exposed, and rotate credentials before use.

## Files

- [`ops/check-vps-status.sh`](../ops/check-vps-status.sh): local SSH wrapper.
- [`ops/vps-status-readonly.sh`](../ops/vps-status-readonly.sh): fixed read-only remote helper to install as root.
