<?php
function autoload ($pClassName) {
    include(__DIR__ . "/module/" . $pClassName . ".php");
}

spl_autoload_register("autoload");
