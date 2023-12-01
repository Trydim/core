<?php

/**
 * @var Main $main - global
 * @var string $cmsAction - extract from query in head.php
 */

class SocketControl {
  /**
   * @var Main
   */
  private $main;

  /**
   * @var string
   */
  private $address;
  /**
   * @var string
   */
  private $port = '9000';
  /**
   * @var int
   */
  private $wsStart;

  public function __construct($main) {
    $this->main = $main;
    $this->address = $_SERVER['HTTP_HOST'];

    $this->wsStart = time();


  }
}

switch ($cmsAction) {
  case 'startWS':
    break;
    $address = $_SERVER['HTTP_HOST'];
    $port = '9000';
    $null = null;

    $wsStart = time();
    $workTimeLimit = 120;

    if (($socket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP)) === false) echo "socket_create() failed: reason: " . socket_strerror(socket_last_error()) . "\n";

    socket_set_option($socket, SOL_SOCKET, SO_REUSEADDR, 1);

    if (socket_bind($socket, 0, $port) === false) echo "socket_bind() failed: reason: " . socket_strerror(socket_last_error($socket)) . "\n";

    if (socket_listen($socket, 5) === false) echo "socket_listen() failed: reason: " . socket_strerror(socket_last_error($socket)) . "\n";

    $clients = [$socket];

    function unmask($text) {
      $length = ord($text[1]) & 127;
      if ($length == 126) {
        $masks = substr($text, 4, 4);
        $data = substr($text, 8);
      } elseif ($length == 127) {
        $masks = substr($text, 10, 4);
        $data = substr($text, 14);
      } else {
        $masks = substr($text, 2, 4);
        $data = substr($text, 6);
      }
      $text = "";
      for ($i = 0; $i < strlen($data); ++$i) {
        $text .= $data[$i] ^ $masks[$i % 4];
      }
      return $text;
    }

    function mask($text) {
      $b1 = 0x80 | (0x1 & 0x0f);
      $length = strlen($text);

      if ($length <= 125)
        $header = pack('CC', $b1, $length);
      elseif ($length > 125 && $length < 65536)
        $header = pack('CCn', $b1, 126, $length);
      elseif ($length >= 65536)
        $header = pack('CCNN', $b1, 127, $length);
      return $header . $text;
    }

    function sendMessage($msg) {
      global $clients;
      foreach ($clients as $changedSocket) {
        @socket_write($changedSocket, $msg, strlen($msg));
      }
      return true;
    }

    function performHandshaking($receivedHeader, $client_conn, $host, $port) {
      $headers = array();
      $lines = preg_split("/\r\n/", $receivedHeader);
      foreach ($lines as $line) {
        $line = chop($line);

        if (preg_match('/\A(\S+): (.*)\z/', $line, $matches)) {
          $headers[$matches[1]] = $matches[2];
        }
      }

      $secKey = $headers['Sec-Websocket-Key'] ?? $headers['Sec-WebSocket-Key'] ?? '';
      $secAccept = base64_encode(pack('H*', sha1($secKey . '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')));
      //$secAccept = base64_encode(pack('H*', sha1($secKey . '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')));
      //hand shaking header
      $upgrade = "HTTP/1.1 101 Web Socket Protocol Handshake\r\n" .
                 "Upgrade: websocket\r\n" .
                 "Connection: Upgrade\r\n" .
                 "WebSocket-Origin: $host\r\n" .
                 "WebSocket-Location: ws://$host:$port/demo/shout.php\r\n" .
                 "Sec-WebSocket-Accept:$secAccept\r\n\r\n";

      socket_write($client_conn, $upgrade, strlen($upgrade));
    }

    while (true) {
      $changed = $clients; //manage multi connections
      //returns the socket resources in $changed array
      socket_select($changed, $null, $null, 0, 10);

      //check for new socket
      if (in_array($socket, $changed)) {
        $socketNew = socket_accept($socket); //accept new socket
        $clients[] = $socketNew;

        $header = socket_read($socketNew, 1024);           // read data sent by the socket
        performHandshaking($header, $socketNew, $address, $port); // perform websocket handshake

        //socket_getpeername($socketNew, $ip); // get ip address of connected socket

        // make room for new socket
        $foundSocket = array_search($socket, $changed);
        unset($changed[$foundSocket]);
      }

      //loop through all connected sockets
      foreach ($changed as $changedSocket) {
        //check for any incoming data
        while (socket_recv($changedSocket, $data, 1024, 0) >= 1) {
          $data = unmask($data);           //unmask data
          $data = json_decode($data, true); //json decode

          $responseText = mask(json_encode(['mode' => 'load']));
          sendMessage($responseText);
          break 2;
        }

        $data = @socket_read($changedSocket, 1024, PHP_NORMAL_READ);
        if ($data === false) { // check disconnected client
          $foundSocket = array_search($changedSocket, $clients);
          socket_getpeername($changedSocket, $ip);
          unset($clients[$foundSocket]);
        }
      }

      if (time() - $wsStart > $workTimeLimit) break;
    }

    socket_close($socket);
    break;
  case 'connect':


    /*$socket = stream_socket_server("tcp://127.0.0.1:8000", $errNo, $errStr);

    if (!$socket) { die("$errStr ($errNo)\n"); }

    while ($connect = stream_socket_accept($socket, -1)) {
      fwrite($connect, "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nConnection: close\r\n\r\nПривет");
      fclose($connect);
    }

    fclose($socket);*/
    break;
  case 'disconnect':
    echo 1;
    break;
}
