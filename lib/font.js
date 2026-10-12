'use strict';

// A 5-line block font for banner(). Every glyph row in a glyph has the same width.
const BANNER_HEIGHT = 5;

const GLYPHS = `
A
 ### 
#   #
#####
#   #
#   #
B
#### 
#   #
#### 
#   #
#### 
C
 ####
#    
#    
#    
 ####
D
#### 
#   #
#   #
#   #
#### 
E
#####
#    
#### 
#    
#####
F
#####
#    
#### 
#    
#    
G
 ####
#    
#  ##
#   #
 ####
H
#   #
#   #
#####
#   #
#   #
I
###
 # 
 # 
 # 
###
J
  ###
    #
    #
#   #
 ### 
K
#   #
#  # 
###  
#  # 
#   #
L
#    
#    
#    
#    
#####
M
#   #
## ##
# # #
#   #
#   #
N
#   #
##  #
# # #
#  ##
#   #
O
 ### 
#   #
#   #
#   #
 ### 
P
#### 
#   #
#### 
#    
#    
Q
 ### 
#   #
# # #
#  # 
 ## #
R
#### 
#   #
#### 
#  # 
#   #
S
 ####
#    
 ### 
    #
#### 
T
#####
  #  
  #  
  #  
  #  
U
#   #
#   #
#   #
#   #
 ### 
V
#   #
#   #
#   #
 # # 
  #  
W
#   #
#   #
# # #
## ##
#   #
X
#   #
 # # 
  #  
 # # 
#   #
Y
#   #
 # # 
  #  
  #  
  #  
Z
#####
   # 
  #  
 #   
#####
Ñ
 ### 
#   #
##  #
# # #
#  ##
0
 ### 
#  ##
# # #
##  #
 ### 
1
 # 
## 
 # 
 # 
###
2
#### 
    #
 ### 
#    
#####
3
#### 
    #
 ### 
    #
#### 
4
#   #
#   #
#####
    #
    #
5
#####
#    
#### 
    #
#### 
6
 ### 
#    
#### 
#   #
 ### 
7
#####
    #
   # 
  #  
  #  
8
 ### 
#   #
 ### 
#   #
 ### 
9
 ### 
#   #
 ####
    #
 ### 
 
   
   
   
   
   
!
#
#
#
 
#
?
### 
   #
 ## 
    
 #  
.
 
 
 
 
#
,
  
  
  
 #
# 
:
 
#
 
#
 
-
    
    
####
    
    
+
     
  #  
#####
  #  
     
'
#
#
 
 
 
"
# #
# #
   
   
   
/
    #
   # 
  #  
 #   
#    
(
 #
# 
# 
# 
 #
)
# 
 #
 #
 #
# 
=
    
####
    
####
    
_
     
     
     
     
#####
<
  #
 # 
#  
 # 
  #
>
#  
 # 
  #
 # 
#  
*
     
# # #
 ### 
# # #
     
#
 # # 
#####
 # # 
#####
 # # 
@
 ### 
# ###
# # #
# ###
 ##  
&
 ##  
#  # 
 ## #
#  # 
 ## #
$
 ####
# #  
 ### 
  # #
#### 
%
#   #
   # 
  #  
 #   
#   #
`;

function parse(source) {
  const lines = source.split('\n').slice(1, -1);
  const font = {};
  for (let i = 0; i < lines.length; i += BANNER_HEIGHT + 1) {
    const rows = lines.slice(i + 1, i + 1 + BANNER_HEIGHT);
    const width = Math.max(...rows.map((r) => r.length));
    font[lines[i] === ' ' || lines[i] === '' ? ' ' : lines[i]] = rows.map((r) => r.padEnd(width));
  }
  return font;
}

const BANNER_FONT = parse(GLYPHS);

module.exports = { BANNER_FONT, BANNER_HEIGHT };
