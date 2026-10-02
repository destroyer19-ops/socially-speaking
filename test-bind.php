<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
$defaults = [
    [1, 'SSC 2026 Attendees 01', 1000, 'link1'],
];
// Just use ReflectionMethod to see if it causes fatal error
class Dummy {
    function bind_param($types, &$a, &$b, &$c, &$d) {
        echo "bound: $types $a $b $c $d\n";
    }
}
$ins = new Dummy();
foreach ($defaults as $d) {
    $ins->bind_param('isis', $d[0], $d[1], $d[2], $d[3]);
}
