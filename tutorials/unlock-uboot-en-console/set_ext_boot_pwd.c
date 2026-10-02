/*
 * Nokia Beacon G6 EXT_BOOT_PWD updater.
 *
 * Usage on the router:
 *   ./set_ext_boot_pwd <expected-current-12-char-verifier> <new-12-char-verifier>
 *
 * The verifier is Base64(SHA256(password))[:12].
 * This helper does NOT accept the plaintext password; calculate the verifier on a trusted host.
 *
 * It uses Nokia's vendor extfs_get()/extfs_set() API, creates a persistent backup,
 * changes exactly 12 bytes, verifies the full 8192-byte readback, and rolls back on failure.
 */

typedef unsigned long size_t;
extern int extfs_get(const char *name, void *buf, int len);
extern int extfs_set(const char *name, const void *buf, int len);

#define SZ 8192
#define VERIFY_LEN 12
#define AT_FDCWD (-100)
#define O_RDONLY 0
#define O_WRONLY 1
#define O_CREAT 0100
#define O_EXCL 0200
#define MODE_0600 0600

static unsigned char before_buf[SZ];
static unsigned char after_buf[SZ];
static unsigned char verify_buf[SZ];
static const char item[] = "SECURITY";
static const char field[] = "EXT_BOOT_PWD";
static const char backup_path[] = "/configs/security-before-uboot-password-change.bin";

static long sc1(long n,long a){register long x8 __asm__("x8")=n;register long x0 __asm__("x0")=a;__asm__ volatile("svc 0":"+r"(x0):"r"(x8):"memory");return x0;}
static long sc3(long n,long a,long b,long c){register long x8 __asm__("x8")=n;register long x0 __asm__("x0")=a;register long x1 __asm__("x1")=b;register long x2 __asm__("x2")=c;__asm__ volatile("svc 0":"+r"(x0):"r"(x8),"r"(x1),"r"(x2):"memory");return x0;}
static long sc4(long n,long a,long b,long c,long d){register long x8 __asm__("x8")=n;register long x0 __asm__("x0")=a;register long x1 __asm__("x1")=b;register long x2 __asm__("x2")=c;register long x3 __asm__("x3")=d;__asm__ volatile("svc 0":"+r"(x0):"r"(x8),"r"(x1),"r"(x2),"r"(x3):"memory");return x0;}
static void ex(int c){register long x8 __asm__("x8")=93;register long x0 __asm__("x0")=c;__asm__ volatile("svc 0"::"r"(x8),"r"(x0):"memory");for(;;){}}
static size_t sl(const char*s){size_t n=0;while(s&&s[n])n++;return n;}
static int eq(const char*a,const char*b){while(*a&&*b&&*a==*b){a++;b++;}return *a==*b;}
static void wrfd(int fd,const char*s){sc3(64,fd,(long)s,(long)sl(s));}
static void out(const char*s){wrfd(1,s);} static void err(const char*s){wrfd(2,s);}
static void zero(void*p,size_t n){unsigned char*d=p;while(n--)*d++=0;}
static void cp(void*d,const void*s,size_t n){unsigned char*dd=d;const unsigned char*ss=s;while(n--)*dd++=*ss++;}
static int cmp(const void*a,const void*b,size_t n){const unsigned char*x=a,*y=b;while(n--){if(*x!=*y)return *x-*y;x++;y++;}return 0;}
static int writeall(int fd,const unsigned char*p,size_t n){while(n){long r=sc3(64,fd,(long)p,(long)n);if(r<=0)return-1;p+=(size_t)r;n-=(size_t)r;}return 0;}
static int readall(int fd,unsigned char*p,size_t n){while(n){long r=sc3(63,fd,(long)p,(long)n);if(r<=0)return-1;p+=(size_t)r;n-=(size_t)r;}return 0;}

static long find_field(const unsigned char *b){
    const size_t fl=12;
    long found=-1;
    for(size_t i=0;i+fl+VERIFY_LEN<=SZ;i++){
        if(cmp(b+i,field,fl)==0){
            if(found!=-1)return -2;
            found=(long)i;
        }
    }
    return found;
}

static int backup(void){
    long fd=sc4(56,AT_FDCWD,(long)backup_path,O_WRONLY|O_CREAT|O_EXCL,MODE_0600);
    if(fd<0){err("ERROR: backup already exists or cannot be created:\n  /configs/security-before-uboot-password-change.bin\nRefusing to write extfs.\n");return-1;}
    if(writeall((int)fd,before_buf,SZ)!=0){err("ERROR: backup write failed. Refusing extfs write.\n");sc3(57,fd,0,0);return-1;}
    sc3(82,fd,0,0); sc3(57,fd,0,0);
    out("Backup created: /configs/security-before-uboot-password-change.bin\n");
    return 0;
}

static int rollback(void){
    zero(verify_buf,SZ);
    if(extfs_set(item,before_buf,SZ)!=0){err("ROLLBACK FAILED: extfs_set(original) failed.\n");return-1;}
    if(extfs_get(item,verify_buf,SZ)!=0){err("ROLLBACK FAILED: readback failed.\n");return-1;}
    if(cmp(before_buf,verify_buf,SZ)!=0){err("ROLLBACK FAILED: original readback mismatch.\n");return-1;}
    out("Rollback succeeded.\n"); return 0;
}

static int mainx(long argc,char **argv){
    zero(before_buf,SZ);zero(after_buf,SZ);zero(verify_buf,SZ);
    if(argc==2 && eq(argv[1],"--show")){
        if(extfs_get(item,before_buf,SZ)!=0){err("ERROR: extfs_get(SECURITY) failed.\n");return 10;}
        long sp=find_field(before_buf);
        if(sp<0){err("ERROR: EXT_BOOT_PWD field not uniquely found.\n");return 11;}
        out("EXT_BOOT_PWD=");
        sc3(64,1,(long)(before_buf+sp+12),VERIFY_LEN);
        out("\n");
        return 0;
    }
    if(argc==2 && eq(argv[1],"--restore")){
        long fd=sc4(56,AT_FDCWD,(long)backup_path,O_RDONLY,0);
        if(fd<0){err("ERROR: backup file not found. Nothing changed.\n");return 30;}
        if(readall((int)fd,before_buf,SZ)!=0){err("ERROR: could not read full backup. Nothing changed.\n");sc1(57,fd);return 31;}
        sc1(57,fd);
        long rp=find_field(before_buf);
        if(rp<0){err("ERROR: backup does not contain one valid EXT_BOOT_PWD field.\n");return 32;}
        if(extfs_set(item,before_buf,SZ)!=0){err("ERROR: extfs_set restore failed.\n");return 33;}
        if(extfs_get(item,verify_buf,SZ)!=0||cmp(before_buf,verify_buf,SZ)!=0){err("ERROR: restore readback mismatch.\n");return 34;}
        out("SUCCESS: original SECURITY backup restored byte-for-byte.\n");
        return 0;
    }
    if(argc!=3 || sl(argv[1])!=VERIFY_LEN || sl(argv[2])!=VERIFY_LEN){
        err("Usage:\n  set_ext_boot_pwd --show\n  set_ext_boot_pwd --restore\n  set_ext_boot_pwd <expected-current-12-char-verifier> <new-12-char-verifier>\n");
        return 2;
    }
    if(extfs_get(item,before_buf,SZ)!=0){err("ERROR: extfs_get(SECURITY) failed. Nothing changed.\n");return 10;}
    long p=find_field(before_buf);
    if(p==-1){err("ERROR: EXT_BOOT_PWD field was not found. Nothing changed.\n");return 11;}
    if(p==-2){err("ERROR: EXT_BOOT_PWD appears more than once. Refusing write.\n");return 12;}
    long vo=p+12;
    if(cmp(before_buf+vo,argv[1],VERIFY_LEN)!=0){
        if(cmp(before_buf+vo,argv[2],VERIFY_LEN)==0){out("SECURITY already contains the requested verifier. No write performed.\n");return 0;}
        err("ERROR: current verifier does not match the expected verifier. Nothing changed.\n");return 13;
    }
    if(backup()!=0)return 14;
    cp(after_buf,before_buf,SZ); cp(after_buf+vo,argv[2],VERIFY_LEN);
    for(size_t i=0;i<SZ;i++) if(before_buf[i]!=after_buf[i] && (i<(size_t)vo || i>=(size_t)vo+VERIFY_LEN)){err("ERROR: internal guard detected an out-of-range modification.\n");return 15;}
    out("Writing SECURITY through vendor extfs_set()...\n");
    if(extfs_set(item,after_buf,SZ)!=0){err("ERROR: extfs_set failed. Attempting rollback...\n");rollback();return 20;}
    if(extfs_get(item,verify_buf,SZ)!=0){err("ERROR: readback failed. Attempting rollback...\n");rollback();return 21;}
    if(cmp(after_buf,verify_buf,SZ)!=0){err("ERROR: full SECURITY readback mismatch. Attempting rollback...\n");rollback();return 22;}
    out("SUCCESS: only the 12-byte EXT_BOOT_PWD verifier changed and full readback matched.\n");
    return 0;
}

__attribute__((used,noinline)) int start_c(long *sp){long argc=sp[0];char **argv=(char**)&sp[1];return mainx(argc,argv);}
__attribute__((naked)) void _start(void){__asm__ volatile("mov x0, sp\nbl start_c\nmov x8, #93\nsvc #0\n");}
