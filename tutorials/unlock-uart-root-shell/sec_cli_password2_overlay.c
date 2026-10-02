/*
 * Nokia Beacon G6 development sec_cli overlay.
 *
 * - `sec_cli startshell ...` asks for Password2 and compares it to the first
 *   line of /configs/debug/password2.txt.
 * - every other sec_cli invocation is delegated unchanged to /sbin/secmulti.
 * - on successful Password2, execs /bin/sh with argv[0] = "-sh".
 *
 * This is intentionally a development helper, not a hardened authentication daemon.
 */

typedef unsigned long size_t;
#define AT_FDCWD (-100)
#define O_RDONLY 0
#define TCGETS 0x5401
#define TCSETS 0x5402
#define ECHO 0x00000008

static const char multicall[]="/sbin/secmulti";
static const char passfile[]="/configs/debug/password2.txt";
static const char shell[]="/bin/sh";
static const char shell0[]="-sh";
static const char startshell[]="startshell";
static const char prompt[]="Password2: ";
static const char bad[]="Password2 invalid!\n";
static const char nofile[]="sec_cli overlay: /configs/debug/password2.txt missing/empty\n";
static const char execmulti[]="sec_cli overlay: exec /sbin/secmulti failed\n";
static const char execsh[]="sec_cli overlay: exec /bin/sh failed\n";

static long sc1(long n,long a){register long x8 __asm__("x8")=n;register long x0 __asm__("x0")=a;__asm__ volatile("svc 0":"+r"(x0):"r"(x8):"memory");return x0;}
static long sc3(long n,long a,long b,long c){register long x8 __asm__("x8")=n;register long x0 __asm__("x0")=a;register long x1 __asm__("x1")=b;register long x2 __asm__("x2")=c;__asm__ volatile("svc 0":"+r"(x0):"r"(x8),"r"(x1),"r"(x2):"memory");return x0;}
static long sc4(long n,long a,long b,long c,long d){register long x8 __asm__("x8")=n;register long x0 __asm__("x0")=a;register long x1 __asm__("x1")=b;register long x2 __asm__("x2")=c;register long x3 __asm__("x3")=d;__asm__ volatile("svc 0":"+r"(x0):"r"(x8),"r"(x1),"r"(x2),"r"(x3):"memory");return x0;}
static size_t sl(const char*s){size_t n=0;while(s[n])n++;return n;}
static void wr(int fd,const char*s){sc3(64,fd,(long)s,(long)sl(s));}
static int eq(const char*a,const char*b){while(*a&&*b&&*a==*b){a++;b++;}return *a==*b;}

struct termios_min { unsigned int iflag, oflag, cflag, lflag; unsigned char rest[48]; };

static int read_expected(char *buf,size_t cap){
    long fd=sc4(56,AT_FDCWD,(long)passfile,O_RDONLY,0);
    if(fd<0)return -1;
    size_t n=0;
    while(n+1<cap){char c; long r=sc3(63,fd,(long)&c,1);if(r<=0)break;if(c=='\n'||c=='\r')break;buf[n++]=c;}
    sc1(57,fd);buf[n]=0;return n?0:-1;
}

static void read_hidden(char *buf,size_t cap){
    struct termios_min oldt,newt; int changed=0;
    if(sc3(29,0,TCGETS,(long)&oldt)>=0){newt=oldt;newt.lflag&=~ECHO;if(sc3(29,0,TCSETS,(long)&newt)>=0)changed=1;}
    wr(1,prompt);size_t n=0;
    while(1){char c;long r=sc3(63,0,(long)&c,1);if(r<=0||c=='\n'||c=='\r')break;if(c==0x7f||c==0x08){if(n)n--;continue;}if(n+1<cap)buf[n++]=c;}
    buf[n]=0;if(changed)sc3(29,0,TCSETS,(long)&oldt);wr(1,"\n");
}

static int run(long argc,char **argv,char **envp){
    if(argc<2||!eq(argv[1],startshell)){
        sc3(221,(long)multicall,(long)argv,(long)envp);wr(2,execmulti);return 127;
    }
    char wanted[128],got[128];
    if(read_expected(wanted,sizeof(wanted))!=0){wr(2,nofile);return 2;}
    read_hidden(got,sizeof(got));
    if(!eq(got,wanted)){wr(1,bad);return 1;}
    char *shargv[2];shargv[0]=(char*)shell0;shargv[1]=0;
    sc3(221,(long)shell,(long)shargv,(long)envp);wr(2,execsh);return 126;
}

__attribute__((used,noinline)) int start_c(long *sp){
    long argc=sp[0];char **argv=(char**)&sp[1];char **envp=&argv[argc+1];return run(argc,argv,envp);
}
__attribute__((naked)) void _start(void){__asm__ volatile("mov x0, sp\nbl start_c\nmov x8, #93\nsvc #0\n");}
